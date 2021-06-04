package faculties

// 学群・学類
interface Faculty {
    // 学群・学類名
    fun getFacultyName(): String

    // 移行要件ルール群
    fun getMigrationRules(): Array<MigrationRule>
}

// 移行要件
interface MigrationRule {
    // ルールのチェックを実行する関数
    fun check(subjects: List<String>): Pair<Boolean, String>

    // ルール名
    fun getName(): String
}