document.addEventListener("DOMContentLoaded", function () {
  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function getRandomSize() {
    return Math.floor(Math.random() * (160 - 70 + 1)) + 60;
  }

  const astralElements = document.querySelectorAll(".astral-content");
  astralElements.forEach(function (element) {
    element.style.backgroundColor = getRandomColor();
    const size = getRandomSize();
    element.style.width = size + "px";
    element.style.height = size + "px";
  });

  const myPopupCustomAstral = document.querySelector("#myPopupCustomAstral");
  const add_astral = document.querySelector("#add_astral");
  const closePopupAstral = document.querySelector("#closePopupAstral");

  add_astral.addEventListener("click", function () {
    myPopupCustomAstral.classList.add("show");
  });

  closePopupAstral.addEventListener("click", function () {
    myPopupCustomAstral.classList.remove("show");
  });

  window.addEventListener("click", function (event) {
    if (event.target == myPopupCustomAstral) {
      myPopupCustomAstral.classList.remove("show");
    }
  });

  const editButtons = document.querySelectorAll('button[id^="edit_astral_"]');
  const closeEditButtons = document.querySelectorAll(
    'button[id^="closePopupEdit_"]'
  );

  editButtons.forEach(function (button, index) {
    button.addEventListener("click", function () {
      document
        .querySelector(`#myPopupCustomEdit_${index}`)
        .classList.add("show");
    });
  });

  closeEditButtons.forEach(function (button, index) {
    button.addEventListener("click", function () {
      document
        .querySelector(`#myPopupCustomEdit_${index}`)
        .classList.remove("show");
    });
  });

  window.addEventListener("click", function (event) {
    editButtons.forEach(function (button, index) {
      if (
        event.target == document.querySelector(`#myPopupCustomEdit_${index}`)
      ) {
        document
          .querySelector(`#myPopupCustomEdit_${index}`)
          .classList.remove("show");
      }
    });
  });

  const myPopupCustomSyst = document.querySelector("#myPopupCustomSyst");
  const add_solar_system = document.querySelector("#add_solar_system");
  const closePopupCss = document.querySelector("#closePopupCss");

  add_solar_system.addEventListener("click", function () {
    myPopupCustomSyst.classList.add("show");
  });

  closePopupCss.addEventListener("click", function () {
    myPopupCustomSyst.classList.remove("show");
  });

  window.addEventListener("click", function (event) {
    if (event.target == myPopupCustomSyst) {
      myPopupCustomSyst.classList.remove("show");
    }
  });
});
