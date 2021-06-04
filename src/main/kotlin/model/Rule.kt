package model

import kotlinx.serialization.*

@Serializable
data class Rule(
    @SerialName("description") val description: String,
    @SerialName("type") val type: String,
    @SerialName("subjects") val subjects: List<String>,
    @SerialName("minimum") val minimum: Int = 0,
    @SerialName("maximum") val maximum: Int = Int.MAX_VALUE
)