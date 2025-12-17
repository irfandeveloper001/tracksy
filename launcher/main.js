const launchTargets = {
  admin: {
    url: "http://localhost:5173",
    label: "Admin Dashboard",
  },
  student: {
    url: "http://localhost:19007",
    label: "Student Portal",
  },
  driver: {
    url: "http://localhost:19008",
    label: "Driver App",
  },
};

const buttons = document.querySelectorAll("[data-target]");

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.target;
    const target = launchTargets[key];

    if (!target) return;

    window.open(target.url, "_blank", "noopener,noreferrer");
  });
});

