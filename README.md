# scs-migration-checker (English)
An unofficial migration requirements checking tool for University of Tsukuba - School of Comprehension Studies faculty.  
You can use this tool at: https://itsu-dev.github.io/scs-migration-checker/

## Features
- Implemented in Kotlin/JS with Gradle

## rule_definitions.json
rule_definitions.json is used by this tool to define the migration requirements. Programs read this file and 
 check whether users' timetable adapts migration requirements each faculty defines.

### Format
- [rule_definitions.json](https://github.com/itsu-dev/scs-migration-checker/blob/master/src/main/kotlin/model/RuleDefinition.kt)
    - version : ```String``` Define version (e.g. 1.0.0)
    - updated_at : ```String``` Define last updated at (e.g. 20210603)
    - author : ```String``` Define author
    - [faculties](https://github.com/itsu-dev/scs-migration-checker/blob/master/src/main/kotlin/model/Faculty.kt) : ```Array<Faculty>```
        - faculty_name : ```String``` Define faculty name. (e.g. 地球学類)
        - [rules](https://github.com/itsu-dev/scs-migration-checker/blob/master/src/main/kotlin/model/Rule.kt) : ```Array<Rule>``` Define migration requirements
            - description : ```String```  The requirement's description
            - type : ```String (required_subjects:応募要件|important_subjects:重点科目上限単位数|required_subjects_limit:応募要件の履修制限|important_subject_limit:重点科目の履修制限|others:その他)```
            - subjects (Optional) : ```Array<String>``` Required subjects **(as name, not ID)**
            - minimum (Optional) : ```Integer``` Minimum subjects count (or unit) of the requirement
            - maximum (Optional) : ```Integer``` Maximum subjects count (or unit) of the requirement
            - message (Optional) : ```String``` Message to display
    
#### Subject name
Subject name must be defined at `````/faculties/rules/subjects`````.
- You must write **the name of the subject, not ID.**
- If you want to specify unit of the subject, you can write ```::(UNIT)``` end of the name. (e.g. ```"微分積分A::2"```)
- If you don't specify unit of the subject, the subject unit will be processed as 1.
- If you want to specify subjects which content "ABC", you can write ```#CONTENTS:ABC```. (e.g. ```#CONTENTS:基礎体育```)
- If you want to specify whole subjects which don't include the required subjects, you can write ```#OTHER_SUBJECTS```.
    
# 総合学域群 移行要件チェックツール 
筑波大学 総合学域群生向けの非公式移行要件チェックツールです。
自分の履修時間割をアップロードすることで判定ができます。
こちらから使用することができます：https://itsu-dev.github.io/scs-migration-checker/?lahl
