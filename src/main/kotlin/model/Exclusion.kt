package model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Exclusion(
    @SerialName("subjects") val subjects: List<String>,
    @SerialName("season") val season: String
    )
