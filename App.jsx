
import { useEffect, useState } from "react";
import classNames from "classnames";

const hours = [
  "08:00–09:30", "09:30–11:00", "11:00–12:30", "12:30–14:00",
  "14:00–15:30", "15:30–17:00", "17:00–18:30", "18:30–20:00", "20:00–22:30"
];

const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const generateInitialTasks = () => {
  const data = {};
  days.forEach(day => {
    data[day] = {};
    hours.forEach(hour => {
      data[day][hour] = { text: "", done: false, priority: "" };
    });
  });
  return data;
};

export default function AgendaVisual() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("agenda-tasks");
    return saved ? JSON.parse(saved) : generateInitialTasks();
  });
  const [filterPriority, setFilterPriority] = useState("");

  useEffect(() => {
    localStorage.setItem("agenda-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleChange = (day, hour, value) => {
    setTasks(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [hour]: { ...prev[day][hour], text: value }
      }
    }));
  };

  const toggleDone = (day, hour) => {
    setTasks(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [hour]: { ...prev[day][hour], done: !prev[day][hour].done }
      }
    }));
  };

  const changePriority = (day, hour, value) => {
    setTasks(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [hour]: { ...prev[day][hour], priority: value }
      }
    }));
  };

  const resetTasks = () => {
    const cleared = generateInitialTasks();
    setTasks(cleared);
    localStorage.setItem("agenda-tasks", JSON.stringify(cleared));
  };

  const allTasks = Object.values(tasks).flatMap(day => Object.values(day));
  const totalTasks = allTasks.filter(t => t.text.trim() !== "").length;
  const doneTasks = allTasks.filter(t => t.done && t.text.trim() !== "").length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const getPriorityColor = (priority) => {
    if (priority === "Alta") return "border-red-500 bg-red-100";
    if (priority === "Media") return "border-yellow-500 bg-yellow-100";
    if (priority === "Baja") return "border-green-500 bg-green-100";
    return "";
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-4 items-center">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">Todas</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
          <button onClick={() => window.print()} className="p-2 bg-blue-600 text-white rounded">Exportar a PDF</button>
          <button onClick={resetTasks} className="p-2 bg-red-600 text-white rounded">Reiniciar semana</button>
        </div>
        <div className="w-full md:w-60">
          <div className="text-sm mb-1">Progreso semanal: {progress}%</div>
          <div className="w-full h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-blue-500 rounded"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-2 overflow-x-auto">
        <div></div>
        {days.map(day => (
          <div key={day} className="text-center font-bold">{day}</div>
        ))}

        {hours.map(hour => (
          <>
            <div className="font-semibold mt-4">{hour}</div>
            {days.map(day => {
              const task = tasks[day][hour];
              if (filterPriority && task.priority !== filterPriority) return <div key={`${day}-${hour}`}></div>;
              return (
                <div key={`${day}-${hour}`} className={classNames("p-2 border rounded min-w-[150px]", getPriorityColor(task.priority))}>
                  <input
                    value={task.text}
                    onChange={e => handleChange(day, hour, e.target.value)}
                    placeholder="Tarea..."
                    className="w-full mb-2 p-1 border rounded"
                  />
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleDone(day, hour)}
                    />
                    <span className="text-sm">Hecho</span>
                  </div>
                  <select
                    value={task.priority}
                    onChange={(e) => changePriority(day, hour, e.target.value)}
                    className="w-full p-1 border rounded"
                  >
                    <option value="">Prioridad</option>
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}
