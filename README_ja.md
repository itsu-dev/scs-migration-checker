[English](README.md)  
  
# 総合学域群 移行要件 チェックツール
筑波大学 総合学域群向けの非公式移行要件チェックツールです。  
こちらから使用することができます: https://itsu-dev.github.io/scs-migration-checker/

## 特徴
- 自分の時間割が移行先の要件を満たしているかの確認  
- 移行要件の一覧表示  
- Kotlin/JSを用いた実装  

## rule_definitions.json
rule_definitions.jsonは移行要件を定義するためにするファイルで、プログラムがこのファイルの内容を読み込むことで
ユーザーの移行要件の適合状況を判定します。  
  
### フォーマット
- [rule_definitions.json](https://github.com/itsu-dev/scs-migration-checker/blob/master/src/main/kotlin/model/RuleDefinition.kt)
    - version : ```String``` ファイルバージョン (例 1.0.0)
    - updated_at : ```String``` 最終更新 (例 20210603)
    - author : ```String``` 作者
    - [faculties](https://github.com/itsu-dev/scs-migration-checker/blob/master/src/main/kotlin/model/Faculty.kt) : ```Array<Faculty>```
        - faculty_name : ```String``` 学群・学類名 (例 地球学類)
        - [rules](https://github.com/itsu-dev/scs-migration-checker/blob/master/src/main/kotlin/model/Rule.kt) : ```Array<Rule>``` 移行要件
            - description : ```String```  要件名（応募要件|応募要件1|応募要件2|重点科目上限単位数|重点科目上限単位数1|重点科目上限単位数2）
            - type : ```String (required_subjects:応募要件|important_subjects:重点科目上限単位数|required_subjects_limit:応募要件の履修制限|important_subject_limit:重点科目の履修制限|others:その他)```
            - subjects (Optional) : ```Array<String>``` 要件に含まれる科目名 **(科目のIDではありません)**
            - minimum (Optional) : ```Integer``` 必要な合計単位
            - maximum (Optional) : ```Integer``` 最大で履修可能な合計単位
            - message (Optional) : ```String``` 表示したいメッセージ

#### 科目名
科目名はJSON内のここに定義される必要があります: `````/faculties/rules/subjects`````
- 科目名は必ず必要があります
- その科目の単位数を指定したい場合は次のように書きます（指定がない場合は1.0となります）: ```::(UNIT)``` (例 ```"微分積分A::2"```)
- ある単語が含まれる科目を指定したい場合は次のように書きます: ```#CONTENTS:ABC``` (例 ```#CONTENTS:基礎体育```)
- 要件内で指定した科目以外のすべての科目を指定したい場合は次のように書きます（MAX_UNIT: 最大履修可能単位数）: ```#OTHER_SUBJECTS:(MAX_UNIT)```

## ライセンス
MPL-2.0 License  
このプログラムは[Mimori256](https://github.com/Mimori256) 氏の[kdb-parse](https://github.com/Mimori256/kdb-parse) を使用しています。
