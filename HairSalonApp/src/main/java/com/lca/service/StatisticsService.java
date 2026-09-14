package com.lca.service;

import com.lca.dtos.response.StatisticsResponseDTO;

public interface StatisticsService {

    StatisticsResponseDTO getDashboard();

    StatisticsResponseDTO getStats(String statsType, int year, Integer month);
}
