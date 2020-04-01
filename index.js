"use strict";

(function() {
  window.addEventListener("load", function() {
    // TODO: add remaining event listeners
    document.getElementById("message").addEventListener("keyup", showFields);
    document.getElementById("separators").addEventListener("keyup", showFields);
    document.querySelectorAll("#id, #latitude, #longitude").forEach(input => {
        const fieldCounter = document.querySelector(`#${input.id}Counter`);
        fieldCounter.innerHTML = input.value;

        input.addEventListener("change", function(e) {
            const fieldCounter = document.querySelector(`#${e.target.id}Counter`);
            const fieldCounterCopy = document.querySelector(`#${e.target.id}CounterCopy`);
            fieldCounter.innerHTML = this.value;
            fieldCounterCopy.innerHTML = this.value;
        });
    });

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName("needs-validation");
    // Loop over them and prevent submission
    var validation = Array.prototype.filter.call(forms, function(form) {
      form.addEventListener("submit", function(event) {
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add("was-validated");
      }, false);
    });
  }, false);
})();

function download() {
    event.preventDefault();

    // required
    const name = document.querySelector("#name").value;
    const separators = document.querySelector("#separators").value;
    const id = document.querySelector("#id").value;
    const idLength = document.querySelector("#id_length").value;
    const fieldCount = document.querySelector("#field_count").value;
    const sendType = document.querySelector("#sendType").value;
    const transport = document.querySelector("#transport").value;
    const replyChannel = document.querySelector("#replyChannel").value;
    const latitude = document.querySelector("#latitude").value;
    const longitude = document.querySelector("#longitude").value;
    const isDMS = document.querySelector("#DMS").checked;

    // optional
    const idRegex = document.querySelector("#id_regex").value;
    const latitudeRegex = document.querySelector("#latitude_regex").value;
    const longitudeRegex = document.querySelector("#longitude_regex").value;
    const messageHandle = document.querySelector("#messageHandle").value;
    const description = document.querySelector("#description").value;
    const json = constructJson();
    console.log(json);

    const requiredValues = [
        name,
        separators,
        id,
        idLength,
        fieldCount,
        sendType,
        transport,
        replyChannel,
        latitude,
        longitude,
        isDMS
    ];
    const valid = requiredValues.every(value => value !== "");

    if (!valid) {
        return;
    }

    const sql = `INSERT INTO configuration VALUES (
    '${name}',
    '${separators}',
    ${id},
    ${idLength},
    '${idRegex}',
    ${fieldCount},
    '${sendType}',
    '${transport}',
    '${replyChannel}',
    '${messageHandle}',
    ${latitude},
    '${latitudeRegex}',
    ${longitude},
    '${longitudeRegex}',
    ${isDMS === "checked" ? "TRUE" : "FALSE"},
    '${description}',
    '${json}'
);`;
    const blob = new Blob([sql], {type: "text/plain"});
    const elem = document.createElement("a");
    elem.href = URL.createObjectURL(blob);
    elem.download = `${name}.sql`;
    document.body.appendChild(elem);
    elem.click()
    document.body.removeChild(elem);
}

function constructJson() {
    let json = "{"
    const jsonSelector = document.querySelector("#json");
    const start = parseInt(jsonSelector.children[1].id.split("_")[1]);
    const end = jsonSelector.childElementCount - 1 + start;

    for (let i = start; i < end; i++) {
        const key = document.querySelector(`#key_${i}`);
        const value = document.querySelector(`#value_${i}`);

        // skip empty inputs
        if (key.value === "" || value.value === "") {
            continue;
        } else if (i !== start) {
            // TODO fix (i !=== start) which adds a wrong comma, when the top row is empty but the others are not
            json += ",";
        }

        json += `"${key.value}":"${value.value}"`
    }
    json += "}"
    return json === "{}" ? "" : json
}

function addOptionalRow(id) {
    const sanitizedId = id.split("_")[1];
    const nextId = parseInt(sanitizedId) + 1;
    const clone = document.querySelector(`#row_${sanitizedId}`).cloneNode(true);
    clone.setAttribute("id", `row_${nextId}`)
    const [key, value, addBtn, remBtn] = [...clone.children]
        .filter((elem, idx) => idx != 1)
        .flatMap(elem => [...elem.children]);

    key.setAttribute("id", `key_${nextId}`);
    key.value = "";
    value.setAttribute("id", `value_${nextId}`);
    value.value = "";
    addBtn.setAttribute("id", `addBtn_${nextId}`);
    remBtn.setAttribute("id", `remBtn_${nextId}`);
    document.querySelector("#json").appendChild(clone);

    const clickedBtn = document.querySelector(`#${id}`);
    const hiddenRemBtn = document.querySelector(`#remBtn_${sanitizedId}`);
    clickedBtn.style.display = "none";
    hiddenRemBtn.style.display = "block";
}

function removeOptionalRow(id) {
    const sanitizedId = id.split("_")[1];
    document.querySelector(`#row_${sanitizedId}`).remove();
}

// Listener is used by multiple events therefore this.value cannot be used
function showFields() {
    const fieldsContainer = document.querySelector(".fieldsContainer");
    const fieldSamples = document.querySelector("#fieldSamples");
    const separators = document.querySelector("#separators").value;
    const message = document.querySelector("#message").value;
    if (message === "") {
        fieldsContainer.classList.remove("show");
        fieldsContainer.classList.remove("animated");
    } else if (!fieldsContainer.classList.contains("show")) {
        fieldsContainer.classList.add("show");
        fieldsContainer.classList.add("animated");
    } else {
        if (separators === "") {
            return;
        }
        const re = new RegExp(`[${separators}]`);
        const fields = message.split(re);
        while (fieldSamples.firstChild) {
            fieldSamples.firstChild.remove();
        }
        const sanitizedFields = fields.filter(field => field !== "")
        sanitizedFields.forEach((field, idx) => {
            const elem = document.createElement("h6");
            elem.innerHTML = `field[${idx}]: ${field}`;
            elem.classList.add("mb-2");
            fieldSamples.appendChild(elem);
        });
        const fieldCount = document.createElement("h6");
        fieldCount.innerHTML = `<br>Field Count: ${sanitizedFields.length}`;
        fieldCount.classList.add("mb-2");
        fieldSamples.appendChild(fieldCount);
    }
}