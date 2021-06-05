import kotlinx.browser.document
import kotlinx.browser.window
import kotlinx.serialization.json.Json
import model.RuleDefinition
import org.w3c.dom.Window
import org.w3c.fetch.Request

object MigrationChecker {

    private lateinit var ruleDefinitions: RuleDefinition
    private var isChecking = false

    // rule_definitions.jsonを読み込む
    fun loadRuleDefinitions() {
        window.fetch(Request("https://raw.githubusercontent.com/itsu-dev/scs-migration-checker/master/docs/rule_definitions.json"))
            .then(onFulfilled = {
                it.text().then { json ->
                    onLoadFinished(json)
                }
            })
    }

    private fun onLoadFinished(json: String) {
        ruleDefinitions = Json.decodeFromString(RuleDefinition.serializer(), json)
        check(listOf("地球環境学1", "地球進化学2", "数学リテラシー1"))
    }

    // 移行要件をチェックする
    // subjects: ユーザの登録済み講義（講義名）
    fun check(subjects: List<String>) {

        if (isChecking) {
            window.alert("判定中です")
            return
        }

        isChecking = true

        ruleDefinitions.faculties.forEach { faculty ->
            var passedRequiredSubjects = true // 応募要件を満足したか
            var passedImportantSubjects = true // 重点科目上限単位数を満たしたかどうか

            val tr = document.createElement("tr")
            document.getElementById("result")!!.appendChild(tr)

            val facultyName = document.createElement("td").also {
                it.innerHTML = faculty.facultyName
            }
            tr.appendChild(facultyName)

            val comments = document.createElement("td")
            tr.appendChild(comments)

            faculty.rules.forEach { rule ->
                when (rule.type) {
                    // 応募要件
                    "required_subjects" -> {
                        var count = 0
                        rule.subjects.forEach { if (subjects.contains(it)) count++ }
                        if (count < rule.minimum) {
                            passedRequiredSubjects = false
                            comments.innerHTML += "応募要件を満たしていません<br />"
                        }
                    }

                    // 重点科目上限
                    "important_subjects" -> {
                        var count = 0
                        rule.subjects.forEach { if (subjects.contains(it)) count++ }
                        if (count < rule.minimum) {
                            passedImportantSubjects = false
                            comments.innerHTML += "重点科目上限を満たしていません<br />"
                        }
                    }
                }
            }

            // 応募要件の〇×
            tr.appendChild(
                document.createElement("td").also {
                    it.innerHTML = if (passedRequiredSubjects) "<span class=\"passed\">〇</span>" else "<span class=\"missed\">×</span>"
                }
            )

            // 重点科目上限の〇×
            tr.appendChild(
                document.createElement("td").also {
                    it.innerHTML = if (passedImportantSubjects) "<span class=\"passed\">〇</span>" else "<span class=\"missed\">×</span>"
                }
            )

            // 移行要件の適合度によって学類の色を変える
            when {
                passedRequiredSubjects && passedImportantSubjects -> facultyName.classList.add("faculty-name-passed") // 応募要件と重点科目上限を満足
                passedRequiredSubjects && !passedImportantSubjects -> facultyName.classList.add("faculty-name-ok") // 応募要件のみ満足
                else -> facultyName.classList.add("faculty-name-missed") // 何も満足していない
            }

        }

        isChecking = false
    }
}
