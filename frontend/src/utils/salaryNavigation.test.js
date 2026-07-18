import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('Employees & Salary is wired into the sidebar and app workspace', () => {
  const sidebar = source('../components/layout/Sidebar.jsx');
  const app = source('../App.jsx');

  assert.match(sidebar, /id:\s*'salary'/);
  assert.match(sidebar, /label:\s*t\('Employees & Salary'\)/);
  assert.match(app, /path="\/salary"/);
  assert.match(app, /EmployeesSalary/);
});
