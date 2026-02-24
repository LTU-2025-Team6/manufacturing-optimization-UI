// Упрощенные интерфейсы для Dashboard API
// Минималистичный подход - только самая важная информация

/**
 * Основная статистика для главной страницы
 * API endpoint: GET /api/dashboard/stats
 */
export interface DashboardStats {
    totalPlans: number;
    activeProviders: number;
    runningOptimizations: number;
    completedThisMonth: number;
}

/**
 * Полные данные для дашборда (опционально для будущего расширения)
 * API endpoint: GET /api/dashboard
 */
export interface DashboardData {
    stats: DashboardStats;
}
