import kotlinx.browser.document
import kotlinx.browser.window
import org.w3c.fetch.Request
import org.w3c.files.FileReader

var isUnder1100px = window.matchMedia("screen and (max-width: 1100px)").matches

fun main() {
    if (isUnder1100px) {
        val p = document.createElement("p")
        p.appendChild(document.createTextNode("Browser width must be upto 1100px."))
        document.getElementById("root")!!.appendChild(p)
    }
}

fun loadRuleDefinitions() {
    //window.fetch(Request())
}