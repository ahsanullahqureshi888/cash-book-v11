import asyncio
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models_plastic import PlasticMachine, PlasticTelemetryPing, PlasticAuditLog
from ..schemas_plastic import TelemetryPingCreate, TelemetryPingResponse


router = APIRouter(prefix="/api/v1/iot", tags=["PlastiCorp IoT Telemetry"])


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass


manager = ConnectionManager()


@router.post("/telemetry", response_model=TelemetryPingResponse)
async def ingest_machine_telemetry(
    ping: TelemetryPingCreate,
    db: Session = Depends(get_db)
):
    """
    High-concurrency IoT endpoint accepting live PLC machine pings.
    Updates machine status, shot counts, temperature, cycle time, and energy draw.
    """
    machine = db.query(PlasticMachine).filter(PlasticMachine.machine_code == ping.machine_code).first()
    if not machine:
        raise HTTPException(status_code=404, detail=f"Machine '{ping.machine_code}' not found.")

    # 1. Update Machine Live Diagnostics
    machine.status = ping.status
    machine.current_temperature_c = ping.temperature_c
    machine.current_cycle_time_sec = ping.cycle_time_sec
    machine.total_shots += ping.shots_count

    # Calculate incremental power kWh & energy cost
    hours_elapsed = (ping.cycle_time_sec * ping.shots_count) / 3600.0
    incremental_kwh = ping.power_kw * hours_elapsed
    energy_cost = incremental_kwh * machine.cost_per_kwh

    # 2. Record Time-Series Telemetry Ping
    db_ping = PlasticTelemetryPing(
        machine_id=machine.id,
        timestamp=datetime.utcnow(),
        status=ping.status,
        temperature_c=ping.temperature_c,
        pressure_bar=ping.pressure_bar,
        cycle_time_sec=ping.cycle_time_sec,
        incremental_shots=ping.shots_count,
        power_kw=ping.power_kw,
        incremental_kwh=round(incremental_kwh, 4),
        operator_role=ping.operator_role
    )
    db.add(db_ping)
    db.commit()
    db.refresh(db_ping)

    # 3. Broadcast Live Machine Update via WebSocket
    payload = {
        "event": "TELEMETRY_PING",
        "machine_code": machine.machine_code,
        "machine_name": machine.name,
        "status": machine.status,
        "temperature_c": machine.current_temperature_c,
        "cycle_time_sec": machine.current_cycle_time_sec,
        "total_shots": machine.total_shots,
        "power_kw": machine.power_kw,
        "incremental_kwh": round(incremental_kwh, 4),
        "energy_cost_usd": round(energy_cost, 4),
        "timestamp": str(db_ping.timestamp)
    }
    asyncio.create_task(manager.broadcast(payload))

    return {
        "id": db_ping.id,
        "machine_id": machine.id,
        "machine_code": machine.machine_code,
        "timestamp": db_ping.timestamp,
        "status": db_ping.status,
        "temperature_c": db_ping.temperature_c,
        "cycle_time_sec": db_ping.cycle_time_sec,
        "power_kw": db_ping.power_kw,
        "incremental_kwh": round(incremental_kwh, 4),
        "energy_cost_usd": round(energy_cost, 4)
    }


@router.websocket("/live")
async def websocket_telemetry_stream(websocket: WebSocket):
    """
    WebSocket endpoint for real-time factory floor IoT machine dashboard streaming.
    """
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo ping for heartbeats
            await websocket.send_json({"type": "HEARTBEAT", "status": "CONNECTED"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
