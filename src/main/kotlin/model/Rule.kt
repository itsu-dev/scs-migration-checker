package model

import kotlinx.serialization.*

@Serializable
data class Rule(
    @SerialName("description") val description: String,
    @SerialName("type") val type: String,
    @SerialName("minimum") val minimum: Int?,
    @SerialName("maximum") val maximum: Int?,
    @SerialName("subjects") val subjects: List<String>
)