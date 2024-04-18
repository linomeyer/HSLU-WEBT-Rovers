const CAMERA_LIST_PERSEVERANCE = ["EDL_RUCAM", "EDL_RDCAM", "EDL_DDCAM", "EDL_PUCAM1", "EDL_PUCAM2", "NAVCAM_LEFT",
    "NAVCAM_RIGHT", "MCZ_RIGHT", "MCZ_LEFT", "FRONT_HAZCAM_LEFT_A", "FRONT_HAZCAM_RIGHT_A", "REAR_HAZCAM_LEFT",
    "REAR_HAZCAM_RIGHT", "SKYCAM", "SHERLOC_WATSON"];
const CAMERA_LIST_CURIOSITY = ["FHAZ", "RHAZ", "MAST", "CHEMCAM", "MAHILI", "MARDI", "NAVCAM"];

document.addEventListener("DOMContentLoaded", () => {
    drawRover();
});

hamburgerMenu();

function hamburgerMenu() {
    const hamburger = document.getElementById("hamburger-menu");
    const navList = document.querySelector(".nav-list");
    const navLink = document.querySelectorAll(".nav-link");

    hamburger.addEventListener("click", toggleHamburger);
    navLink.forEach(n => n.addEventListener("click", toggleHamburger));

    function toggleHamburger() {
        hamburger.classList.toggle("active");
        navList.classList.toggle("active");
    }
}


function submitForm() {
    let perseveranceSelect = document.getElementById("rover-select-perseverance");
    let curiositySelect = document.getElementById("rover-select-curiosity");
    let camera = document.getElementById("camera").value;
    let errorCamera = document.getElementById("error-camera");

    let isValid = validation();
    if (isValid) {
        post()
    }

    return false;

    function validation() {
        let isValid = true;

        // Checkbox validation
        if ((!perseveranceSelect.checked && !curiositySelect.checked) || (perseveranceSelect.checked && curiositySelect.checked)) {
            isValid = false;
            document.getElementById("error-rover-selection").textContent = "Bitte wählen Sie eine der beiden Optionen aus!";
        } else {
            document.getElementById("error-date").textContent = "";
        }

        /* date validation
         valueAsDate tries to convert the date input string to a date object and returns null if the format is invalid
         this also returns null for input values like "" or 13.18.2022 */
        if (document.getElementById("date").valueAsDate === null) {
            isValid = false;
            document.getElementById("error-date").textContent = "Bitte geben Sie ein valides Datum ein!";
        } else {
            document.getElementById("error-date").textContent = "";
        }

        // camera validation
        // camera is allowed to be empty
        if (perseveranceSelect.checked && camera !== "" && CAMERA_LIST_PERSEVERANCE.indexOf(camera) === -1) {
            isValid = false;
            errorCamera.textContent = "Bitte geben Sie nichts oder eine der möglichen Kameras für den Rover Perseverance ein! (Bsp. NAVCAM_RIGHT, SKYCAM, MCZ_LEFT)";
        } else if (curiositySelect.checked && camera !== "" && CAMERA_LIST_CURIOSITY.indexOf(camera) === -1) {
            isValid = false;
            errorCamera.textContent = "Bitte geben Sie nichts oder eine der möglichen Kameras für den Rover curiosity ein! (Bsp. FHAZ, RHAZ, MAST, NAVCAM)";
        } else {
            document.getElementById("error-camera").textContent = "";
        }
        return isValid
    }

    function post() {
        let data = {
            isPerseveranceRover: perseveranceSelect.checked,
            isCuriosityRover: curiositySelect.checked,
            date: document.getElementById("date").value,
            camera: camera
        }
        fetch("backend.php", {
            method: "POST",
            body: JSON.stringify(data)
        }).then(response => response.json())
            .then(data => {
                if (data["numberOfPhotosAtDate"] > 0) {
                    document.getElementById("rover-active").innerText = "Status: " + data["roverStatus"];
                    document.getElementById("total-photos").innerText = "Total aller Fotos des Rovers: " + data["roverTotalPhotos"];
                    document.getElementById("number-of-requests").innerText = "Anzahl Ihrer Abfragen: " + data["requestCount"];
                    document.getElementById("number-of-photos").innerText = "Anzahl Fotos an gegebenem Datum: " + data["numberOfPhotosAtDate"];
                    document.getElementById("rover-photo").src = data["roverImgSrc"].replaceAll("\\", "");
                } else {
                    document.getElementById("rover-active").innerText = "An diesem Datum gibt es leider kein Foto mit den gegebenen Angaben.";
                    document.getElementById("total-photos").innerText = "";
                    document.getElementById("number-of-requests").innerText = "";
                    document.getElementById("number-of-photos").innerText = "";
                    document.getElementById("rover-photo").src = "";
                }
                document.getElementById("rover-active").scrollIntoView();
            }).catch(error => console.log(error));
    }

}

function drawRover() {
    const canvas = document.getElementById("rover-drawing");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // wheels in background
    ctx.fillStyle = "DarkGray";
    drawWheel(265, 480, 45);
    drawWheel(465, 480, 45);
    // wheels in foreground
    ctx.fillStyle = "silver";
    drawWheel(330, 480, 50);
    drawWheel(530, 480, 50);

    // body
    ctx.fillRect(150, 250, 500, 200);

    drawHeadAnimation();

    function drawHeadAnimation() {
        let moveToRight = true;
        let x = 175;
        // this interval moves the head by 2px every 20ms to the left or right
        setInterval(() => {
            // change direction if it moved far enough in one direction
            x <= 175 ? moveToRight = true : moveToRight;
            x >= 575 ? moveToRight = false : moveToRight;

            // move along the x-axis in 2px intervals
            moveToRight ? x += 2 : x -= 2;
            drawHead(x);
        }, 20);
    }

    function drawHead(x) {
        ctx.clearRect(0,0,800,250);
        ctx.fillStyle = "silver";
        // neck
        ctx.fillRect(x, 150, 50, 100);
        // head
        ctx.fillRect(x - 25, 100, 100, 50);

        // eyes
        ctx.fillStyle = "orange";
        drawEye(x, 125);
        drawEye(x + 50, 125);
    }

    function drawEye(x, y) {
        ctx.beginPath();
        ctx.fillStyle = "orange";
        ctx.arc(x, y, 15,0, 2 * Math.PI);
        ctx.fill();
    }
    function drawWheel(x, y, radius) {
        ctx.beginPath();
        ctx.arc(x, y,radius, 0,2 * Math.PI);
        ctx.fill();
    }
}