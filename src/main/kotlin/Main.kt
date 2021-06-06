import kotlinx.browser.document
import kotlinx.browser.window
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonBuilder
import kotlinx.serialization.json.JsonConfiguration
import model.RuleDefinition
import org.w3c.dom.HTMLInputElement
import org.w3c.dom.events.EventListener
import org.w3c.fetch.Body
import org.w3c.fetch.Request
import org.w3c.files.Blob
import org.w3c.files.FileList
import org.w3c.files.FileReader
import org.w3c.files.get

private var csvFile: Blob? = null

fun main() {
    MigrationChecker.loadRuleDefinitions()

    document.getElementById("start-checking")?.addEventListener("click", EventListener { onStartCheckingButtonClicked() })
    document.getElementById("subjects-csv")?.addEventListener("change", EventListener { event ->
        val file = (event.target as HTMLInputElement).files?.get(0) ?: run {
            window.alert("ファイルを選択してください。")
            return@EventListener
        }

        if (!file.name.endsWith(".csv")) {
            window.alert("CSVファイルにのみ対応しています。")
            return@EventListener
        }

        csvFile = file
        resetTable()
    })
}

private fun onStartCheckingButtonClicked() {
    // CSVファイルがnullのとき
    csvFile ?: run {
        window.alert("ファイルを選択してください。")
        return
    }

    val reader = FileReader()
    reader.readAsText(csvFile!!)
    reader.onload = {
        MigrationChecker.checkWithCSV(reader.result as String)
    }
}

fun resetTable() {
    document.getElementById("result")!!.let {
        it.textContent = "" // 表を初期化
        it.innerHTML = """
                            <th>学群・学類</th>
                            <th class="message-box-th">メッセージ</th>
                            <th class="result-box">応募要件</th>
                            <th class="result-box">重点科目上限</th>
            """.trimIndent()
    }

    document.getElementById("subjects-box")!!.let {
        it.textContent = ""
    }
}