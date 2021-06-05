import kotlinx.browser.document
import kotlinx.browser.window
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonBuilder
import kotlinx.serialization.json.JsonConfiguration
import model.RuleDefinition
import org.w3c.dom.events.EventListener
import org.w3c.fetch.Body
import org.w3c.fetch.Request

var isUnder1100px = window.matchMedia("screen and (max-width: 1100px)").matches

fun main() {
    MigrationChecker.loadRuleDefinitions()

    document.getElementById("start-checking")?.addEventListener("click", EventListener { onStartCheckingButtonClicked() })
}

private fun onStartCheckingButtonClicked() {
    MigrationChecker.check(
        listOf(
            "数学リテラシー1",
            "化学1",
            "数学リテラシー2",
            "力学1",
            "力学2",
            "化学2",
            "電磁気学1",
            "力学3",
            "電磁気学2",
            "線形代数3",
            "化学3",
            "微積分3",
            "電磁気学3",
            "微積分1",
            "微積分2",
            "線形代数1",
            "線形代数2",
            "知識情報概論",
            "情報メディア入門",
            "知能と情報科学",
            "知識情報システム概説"
        )
    )
}