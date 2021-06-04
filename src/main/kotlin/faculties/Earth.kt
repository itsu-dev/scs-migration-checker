package faculties

class Earth : Faculty {

    private val rules = arrayOf(
        Rule1()
    )

    override fun getFacultyName(): String {
        return "地球学類"
    }

    override fun getMigrationRules(): Array<MigrationRule> {
        TODO("Not yet implemented")
    }

}

// 応募要件
class Rule1 : MigrationRule {

    private val requiredSubjects = arrayOf(
        "EE11151", // 地球環境学1
        "EE11161", // 地球環境学2
        "EE11251", // 地球進化学1
        "EE11261"  // 地球進化学2
    )

    // 応募要件：requiredSubjectsの中から2単位以上
    override fun check(subjects: List<String>): Pair<Boolean, String> {
        var count = 0
        requiredSubjects.forEach {
            if (subjects.contains(it)) count++
        }

        return if (count >= 2) {
            true to "応募要件を満たしています"

        } else {
            false to "${requiredSubjects}の中から2単位以上を取得する必要があります"
        }
    }

    override fun getName(): String {
        return "rule_1"
    }
}

// 重点科目
class Rule2 : MigrationRule {

    private val requiredSubjects = arrayOf(
        "EE11151", // 地球環境学1
        "EE11161", // 地球環境学2
        "EE11251", // 地球進化学1
        "EE11261", // 地球進化学2
        "AC56031", // フィールド文化領域比較文化研究
        "EB00001", "FCA1961", "FE11431", "FG06141", // 生物学序説
        "FF17011", // 応用理工学概論
        "FA01111", "FA01121", "FA01131", "FA01141",
        "FA01151", "FA01161", "FA01171", "FA01181",
        "FA01191", "FA011A1", "FA011B1", "FA011C1",
        "FA011D1", "FA011E1", // 数学リテラシ-1
        "FE11161", // 化学概論
        "FE11171", "FE11271", // 化学1
        "EC12201", // 生物資源学にみる食品科学・技術の最前線
        "FA01211", "FA01221", "FA01231", "FA01241",
        "FA01251", "FA01261", "FA01271", "FA01281",
        "FA01291", "FA012A1", "FA012B1", "FA012C1",
        "FA012D1", "FA012E1", // 数学リテラシー2
        "FCB1201", "FCB1211", "FCB1231", "FCB1241", // 力学1

    )

    override fun check(subjects: List<String>): Pair<Boolean, String> {
        return true to ""
    }

    override fun getName(): String {
        return "rule_2"
    }
}