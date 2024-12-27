const menuBtn = document.querySelector(".menu");
const navLinks = document.querySelector(".nav-links-user");

menuBtn.addEventListener('click', () =>{
    navLinks.classList.toggle('mobile-menu');
});


const myPopup = document.querySelector('#myPopupStars');
const popupLink = document.querySelector('#popupLink');
const closePopup = document.querySelector('#closePopup');

popupLink.addEventListener(
    "click",
    function () {
        myPopup.classList.add("show");
    }
);
closePopup.addEventListener(
    "click",
    function () {
        myPopup.classList.remove(
            "show"
        );
    }
);
window.addEventListener(
    "click",
    function (event) {
        if (event.target == myPopup) {
            myPopup.classList.remove(
                "show"
            );
        }
    }
);
