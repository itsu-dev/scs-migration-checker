package model

import kotlinx.serialization.Serializable

@Serializable
data class KdB(
    val data: Map<String, List<String>>
) {
    fun getSeasonByName(name: String): String? {
        return data.values.firstOrNull { it[0] == name }?.let {
            "${it[1]} ${it[2]}"
        }
    }
}
