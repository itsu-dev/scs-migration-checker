package model

import kotlinx.serialization.*

@Serializable
data class RuleDefinition(
    @SerialName("version") val version: String,
    @SerialName("updated_at") val updatedAt: String,
    @SerialName("author") val author: String,
    @SerialName("exclusions") val exclusions: List<Exclusion>,
    @SerialName("faculties") val faculties: List<Faculty>
) {
    fun getExclusionSeason(subject: String): String? {
        exclusions.forEach { exclusion ->
            exclusion.subjects.forEach {
                if (it == subject) return exclusion.season
            }
        }
        return null
    }
}