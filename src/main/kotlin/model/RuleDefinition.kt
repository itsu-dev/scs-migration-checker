package model

import kotlinx.serialization.*

@Serializable
data class RuleDefinition(
    @SerialName("version") val version: String,
    @SerialName("updated_at") val updatedAt: String,
    @SerialName("author") val author: String,
    @SerialName("faculties") val faculties: Map<String, Faculty>
)
