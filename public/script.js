const delete_icons = document.getElementsByClassName("delete-icon");

[...delete_icons].forEach(function (icon) {
  icon.addEventListener("mouseover", function () {
    icon.classList.add("fa-bounce");
  });

  icon.addEventListener("mouseout", function () {
    icon.classList.remove("fa-bounce");
  });
});
