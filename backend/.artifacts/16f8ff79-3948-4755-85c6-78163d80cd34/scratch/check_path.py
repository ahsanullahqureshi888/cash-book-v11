import sys
import os
print(f"Current Dir: {os.getcwd()}")
print(f"Path: {sys.path}")
try:
    import backend
    print("Backend imported successfully")
except ImportError as e:
    print(f"Failed to import backend: {e}")
