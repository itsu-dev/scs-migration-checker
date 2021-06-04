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
        window.fetch(Request("https://raw.githubusercontent.com/itsu-dev/scs-migration-checker/master/docs/rule_definitions.json")).then(onFulfilled = {
            it.text().then { json ->
                onLoadFinished(json)
            }
        })
    }

    private fun onLoadFinished(json: String) {
        // console.log(json)
        ruleDefinitions = Json.decodeFromString(RuleDefinition.serializer(), json)
        check(listOf("数学リテラシー1", "数学リテラシー2"))
    }

    // 移行要件をチェックする
    // subjects: ユーザの登録済み講義（講義名）
    fun check(subjects: List<String>) {
        if (isChecking) {
            window.alert("判定中です")
            return
        }

        isChecking = true

        ruleDefinitions.faculties.values.forEach { faculty ->
            var passedRequiredSubjects = true // 応募要件を満足したか
            var passedImportantSubjects = true // 重点科目上限単位数を満たしたかどうか

            faculty.rules.forEach { rule ->
                when (rule.type) {
                    // 応募要件
                    "required_subjects" -> {
                        var count = 0
                        rule.subjects.forEach { if (subjects.contains(it)) count++ }
                        if (count < rule.minimum) {
                            passedRequiredSubjects = false
                            document.getElementById("root")!!.appendChild(
                                document.createElement("p").appendChild(
                                    document.createTextNode("応募要件を満たしていません")
                                )
                            )
                        }
                    }

                    // 応募要件
                    "important_subjects" -> {
                        var count = 0
                        rule.subjects.forEach { if (subjects.contains(it)) count++ }
                        if (count < rule.minimum) {
                            passedImportantSubjects = false
                            document.getElementById("root")!!.appendChild(
                                document.createElement("p").appendChild(
                                    document.createTextNode("重点科目上限単位数を超えていません")
                                )
                            )
                        }
                    }
                }
            }
        }

        isChecking = false
        document.getElementById("root")!!.appendChild(
            document.createElement("p").appendChild(
                document.createTextNode("終了")
            )
        )
    }
}
