"use strict"

let INTERPOLATION_COUNT = 0

window.onload = function () {
    // Service Worker
    if("serviceWorker" in navigator) {
        navigator.serviceWorker.register("sw.js")
    }

    canvas.addEventListener("dragenter", preventDefault, false)
    canvas.addEventListener("dragleave", canvas_dragleave, false)
    canvas.addEventListener("dragover", canvas_dragover, false)
    canvas.addEventListener("drop", canvas_dropped, false)
    setup_interpolation_input()
    let preset_colors = document.querySelectorAll("#wheel > :not(.add-color)")
    preset_colors.forEach(normalize)
    select_color(preset_colors[0])
    load_image('images/Arkham Knight.jpg')
}

function preventDefault(e) {
    e.preventDefault()
    e.stopPropagation()
}

function canvas_dragleave(event) {
    event.preventDefault()
    canvas.style.filter = ""
}

function canvas_dragover(event) {
    event.preventDefault()
    canvas.style.filter = "blur(2px)"
}

function canvas_dropped(event) {
    event.preventDefault()
    canvas.style.filter = ""
    let data = event.dataTransfer
    let txt = data.getData('text')
    const eds = ["jpg", "png"]
    if (data.files.length != 0) {
        print("Detected: %c File ", "color:white;background-color:green;text-transform:uppercase;")
        print("DATA:", event)
        uploaded(data)
        setup_slider()
    }
    else if (eds.includes(txt.substring(txt.lastIndexOf(".") + 1))) {
        print("Detected: %c URL ", "color:white;background-color:green;text-transform:uppercase;")
        print(txt)
        load_image(txt)
    }
    else {
        print("Uploaded file/url is invalid")
    }
}

function file_upload(event) {
    if (event.button == 0) // LMB
    {
        document.getElementById("file").click()
    }
}

function uploaded(x) {
    load_image(URL.createObjectURL(x.files[0]))
}

function create_color(x, v) {
    let ele = document.createElement("div")
    ele.setAttribute("onclick", "select_color(this)")
    ele.setAttribute("text", "WHITE")
    if (v == 0) {
        x.after(ele)
    }
    else {
        x.before(ele)
    }
    normalize(ele)
    select_color(ele)

    select_text()
}

function select_text() {
    let sss = document.createRange()
    sss.selectNodeContents(document.querySelector("ctext"))
    window.getSelection().removeAllRanges()
    window.getSelection().addRange(sss)
}

function select_color(x) {
    if (x == null) x = document.querySelectorAll("#wheel .active")[0]
    x.parentElement.querySelectorAll(".active").forEach(ele => {
        ele.classList.remove("active")
        ele.setAttribute("text", document.querySelector("ctext").innerText)
        normalize(ele)
    })
    x.classList.add("active")
    let add_buttons = document.querySelectorAll("div.add-color")
    x.before(add_buttons[0])
    x.after(add_buttons[1])

    document.querySelector("ctext").innerHTML = x.getAttribute("text")
    select_text()
}

/**
* Takes in the color button, changes its color, validates input
* If the parameter <b>x</b> is null, the function find the currently active color button
*/
function normalize(x) {
    if (x == null) x = document.querySelectorAll("#wheel .active")[0]
    let text = x.getAttribute("text")
    if (text.match(/\//)) {
        let fr = 0
        // Make all word arguments uppercase
        let args = text.toUpperCase().split(/\s*\/\s*/g)
        
        let value = `get_color_towards(${args.join(",")}, fr)`
        x.setAttribute("value", value)
        args = args.map(arg => eval(arg))
        x.style.setProperty("background", "linear-gradient(to right, " + rgba_to_text(args[0]) + ", " + rgba_to_text(args[1]) + ")")
    }
    else {
        text = text.toUpperCase()
        let value = eval(text)
        // Add alpha
        if (value.length == 3) {
            value.push(255)
        }
        x.setAttribute("value", "[" + value + "]")
        x.style.setProperty("background", rgba_to_text(value))
    }
}

function delete_selected() {
    let wheel = document.querySelector("#wheel")
    if(wheel.childElementCount == 3) return

    let selected = wheel.querySelector(".active")
    let selected_after_deleting = wheel.querySelector(":not(.active, .add-color)")
    print(selected_after_deleting)
    select_color(selected_after_deleting)
    selected.remove()
}

function ctext_pressed(event) {
    if (event.keyCode == 13) { // [ENTER]
        print(event.target)
        document.querySelectorAll("#wheel .active")[0].setAttribute("text", event.target.innerText)

        try {
            normalize(null)
        }
        catch (event) {
            print(event)
            print("%cINVALID COLOR!", "color:red")
        }
        event.preventDefault()
    }
}

function setup_interpolation_input() {
    document.querySelector(".interpolation__decrease").onclick = event => {
        if(INTERPOLATION_COUNT == 0) {
            return
        }
        --INTERPOLATION_COUNT
        document.querySelector(".interpolation__count").innerText = INTERPOLATION_COUNT
        const PALETTE_COUNT = document.querySelector("#wheel").childElementCount - 2
        print(`${1 + (PALETTE_COUNT - 1) * (2**INTERPOLATION_COUNT)} colors will be created`)
        paint()
    }
    document.querySelector(".interpolation__increase").onclick = event => {
        if(INTERPOLATION_COUNT == 8) {
            return
        }
        ++INTERPOLATION_COUNT
        document.querySelector(".interpolation__count").innerText = INTERPOLATION_COUNT
        const PALETTE_COUNT = document.querySelector("#wheel").childElementCount - 2
        print(`${1 + (PALETTE_COUNT - 1) * (2**INTERPOLATION_COUNT)} colors will be created`)
        paint()
    }
}