import kotlinx.browser.document
import kotlinx.browser.window
import kotlinx.serialization.json.Json
import model.RuleDefinition
import org.w3c.dom.Element
import org.w3c.dom.asList
import org.w3c.dom.events.EventListener
import org.w3c.fetch.Request

object MigrationChecker {

    private lateinit var ruleDefinitions: RuleDefinition
    private var isChecking = false

    // rule_definitions.jsonを読み込む
    fun loadRuleDefinitions() {
        window.fetch(Request("https://raw.githubusercontent.com/itsu-dev/scs-migration-checker/subject-list/src/main/resources/rule_definitions.json"))
            .then(onFulfilled = {
                it.text().then { json ->
                    onLoadFinished(json)
                }
            })
    }

    private fun onLoadFinished(json: String) {
        ruleDefinitions = Json.decodeFromString(RuleDefinition.serializer(), json)
        console.log("[Rule Definitions] Version: ${ruleDefinitions.version} Last Updated At: ${ruleDefinitions.updatedAt}")
    }

    // 移行要件をチェックする
    // userSubjects: ユーザの登録済み講義 <講義名, 単位>
    private fun check(userSubjects: Map<String, Double>) {

        if (isChecking) {
            window.alert("確認中です")
            return
        }

        isChecking = true

        // rule_definitions.jsonの学群・学類で回す
        ruleDefinitions.faculties.forEach { faculty ->
            var passedRequiredSubjects: Boolean? = null // 応募要件を満足したか
            var passedImportantSubjects: Boolean? = null // 重点科目上限単位数を満たしたか

            val subjectSummary = document.createElement("tr").also {
                it.addEventListener("click", EventListener {
                    val subjectDetails = document.getElementsByName(faculty.facultyName)
                    subjectDetails.asList().forEach { node ->
                        if (node is Element) {
                            if (node.getAttribute("hidden").toBoolean()) node.removeAttribute("hidden")
                            else node.setAttribute("hidden", "true")
                        }
                    }
                })
            }
            document.getElementById("result")!!.appendChild(subjectSummary)

            // テーブルの「講義名」
            val facultyName = document.createElement("td").also {
                it.innerHTML = faculty.facultyName
            }
            subjectSummary.appendChild(facultyName)

            // テーブルの「メッセージ」
            val comments = document.createElement("td").also {
                it.classList.add("message-box")
            }
            subjectSummary.appendChild(comments)

            // 各学群・学類で定義された要件を回す
            faculty.rules.forEach { rule ->
                var analyzed = 0.0 to emptyMap<String, Boolean>()

                when (rule.type) {
                    // 応募要件
                    "required_subjects" -> {
                        passedRequiredSubjects ?: run {
                            passedRequiredSubjects = true
                        }
                        analyzed = analyzeUnit(userSubjects, rule.subjects)
                        if (analyzed.first < rule.minimum || analyzed.first > rule.maximum) passedRequiredSubjects = false
                    }

                    // 重点科目上限単位数
                    "important_subjects" -> {
                        passedImportantSubjects ?: run {
                            passedImportantSubjects = true
                        }
                        analyzed = analyzeUnit(userSubjects, rule.subjects)
                        if (analyzed.first < rule.minimum || analyzed.first > rule.maximum) passedImportantSubjects = false
                    }

                    // 応募要件の制限単位
                    "required_subjects_limit" -> {
                        val count = analyzeUnit(userSubjects, rule.subjects)
                        if (count.first > rule.maximum) {
                            var text = ""
                            rule.subjects.forEach {
                                val split = it.split("::") // 講義名::単位
                                text +=
                                    if (split.size == 1) ",　${split[0]} (1単位)"
                                    else ",　${split[0]} (${split[1]}単位)"
                            }
                            comments.innerHTML += "・${text.substring(2)}のうち、最大で取ることができるのは${rule.maximum}単位までです (履修予定：${count.first.toInt()}単位)<br />"
                        }
                    }
                }


                if (rule.isMain) {
                    val subjectDetails = document.createElement("tr").also {
                        it.setAttribute("name", faculty.facultyName)
                        it.setAttribute("hidden", "true")

                        val ruleTitle = document.createElement("td").also {
                            it.setAttribute("colspan", "1")
                            it.classList.add("subject-details-name")
                            it.innerHTML = rule.description
                        }
                        it.appendChild(ruleTitle)

                        val subjectsList = document.createElement("td").also {
                            it.setAttribute("colspan", "3")
                            it.classList.add("subject-details-content")

                            var text = ""
                            analyzed.second.forEach { subject ->
                                text += ", <span class=\"${if (subject.value) "passed-subject" else "missed-subject"}\">${subject.key}</span>"
                            }
                            text = "ここから${rule.minimum}単位以上 (登録済み: ${analyzed.first}単位)<br />" + text.substring(2)
                            it.innerHTML += text
                        }
                        it.appendChild(subjectsList)
                    }

                    document.getElementById("result")!!.appendChild(subjectDetails)
                }

                // メッセージがあれば表示
                if (rule.message.isNotEmpty()) {
                    comments.innerHTML += "・${rule.message}<br />"
                }
            }

            // メッセージを表示
            if (passedRequiredSubjects == false) comments.innerHTML += "・応募要件を満たしていません<br />"
            if (passedImportantSubjects == false) comments.innerHTML += "・重点科目上限を超えていません<br />"

            // 応募要件の〇×-
            subjectSummary.appendChild(
                document.createElement("td").also {
                    it.innerHTML = when (passedRequiredSubjects) {
                        true -> "<span class=\"passed\">〇</span>"
                        false -> "<span class=\"missed\">×</span>"
                        else -> "<span>-</span>"
                    }
                }
            )

            // 重点科目上限の〇×-
            subjectSummary.appendChild(
                document.createElement("td").also {
                    it.innerHTML = when (passedImportantSubjects) {
                        true -> "<span class=\"passed\">〇</span>"
                        false -> "<span class=\"missed\">×</span>"
                        else -> "<span>-</span>"
                    }
                }
            )

            // 移行要件の適合度によって学類の色を変える
            when {
                // 応募要件と重点科目上限を満足
                passedRequiredSubjects != false && passedImportantSubjects != false ->
                    facultyName.classList.add("faculty-name-passed")

                // 応募要件のみ満足
                passedRequiredSubjects != false && passedImportantSubjects == false ->
                    facultyName.classList.add("faculty-name-ok")

                // 何も満足していない
                else -> facultyName.classList.add("faculty-name-missed")
            }

        }

        isChecking = false
    }

    // 各要件が要求する単位の計算
    private fun analyzeUnit(userSubjects: Map<String, Double>, ruleSubjects: List<String>): Pair<Double, Map<String, Boolean>> {
        var unit = 0.0
        val subjects = mutableMapOf<String, Boolean>()

        ruleSubjects.forEach { ruleSubject ->
            when {
                // その他の講義の場合
                ruleSubject.startsWith("#OTHER_SUBJECTS") -> {
                    var unitCount = 0.0
                    val maxUnit = ruleSubject.split(":")[1].toInt()
                    userSubjects.forEach otherSubjects@ {
                        if (!ruleSubjects.contains(it.key)) {
                            if (unitCount + it.value <= maxUnit) {
                                unit += it.value
                                unitCount += it.value
                                if (unitCount >= maxUnit) {
                                    subjects["その他の科目 (${maxUnit}単位以上)"] = true
                                    return@otherSubjects
                                }
                            }
                        }
                    }
                }

                // ~から始まる講義名の場合 ex) #CONTENTS:基礎体育
                ruleSubject.startsWith("#CONTENTS") -> {
                    userSubjects
                        .filter { it.key.startsWith(ruleSubject.split(":")[1]) }
                        .forEach {
                            unit += it.value
                            subjects["${it.key} (${it.value}単位)"] = true
                        }
                }

                // いずれにも該当しない場合
                // 講義名::単位の講義名のみを抜き出す（単位はCSVから読み込んだものを使う）
                userSubjects.contains(ruleSubject.split("::")[0]) -> {
                    val split = ruleSubject.split("::")
                    unit += userSubjects[split[0]]!!
                    subjects["${split[0]} (${userSubjects[split[0]]!!}単位)"] = true
                }

                else -> {
                    val split = ruleSubject.split("::")
                    subjects["${split[0]} (${if (split.size > 1) split[1] else 1}単位)"] = false
                }
            }
        }
        return unit to subjects
    }

    /*
     CSVファイルを読み込む。CSVライブラリが使えなかったため独自実装。
     KdBもどきから得られるCSVは
     ～
     "FA01111
     数学リテラシー1","1.0単位
     春A火5
     ～
     のように、"講義番号\n講義名","単位のようになっているため、以下のような実装になっている。
     */
    fun checkWithCSV(csv: String) {
        resetTable()

        document.getElementById("subjects-box")!!.innerHTML += "<h3>検出された科目</h3>"

        val subjects = mutableMapOf<String, Double>()
        val split = csv.split("\n")
        var subjectText = ""

        var sum = 0.0
        split.forEachIndexed { index, text ->
            if (text.matches("^(\")([a-zA-Z0-9]{7})\$") && split.size - 1 > index + 1) {
                val data = split[index + 1].split("\",\"")
                val subject = data[0]
                val unit = data[1].match("[+-]?\\d+(?:\\.\\d+)?")!![0].toDouble()
                sum += unit
                subjects[subject] = unit
                subjectText += ",　$subject (${unit}単位)"
            }
        }

        document.getElementById("subjects-box")!!.innerHTML += "<p>合計${sum}単位：${subjectText.substring(2)}</p>"

        check(subjects)
    }
}
