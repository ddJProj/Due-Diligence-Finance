package com.ddfinance.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.task.TaskExecutor;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Configuration for asynchronous task execution and scheduling.
 * Configures thread pools for async operations and scheduled tasks.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Configuration
@EnableAsync
@EnableScheduling
@Slf4j
public class AsyncConfig implements AsyncConfigurer {

    @Value("${app.async.core-pool-size:2}")
    private int corePoolSize;

    @Value("${app.async.max-pool-size:10}")
    private int maxPoolSize;

    @Value("${app.async.queue-capacity:500}")
    private int queueCapacity;

    @Value("${app.async.thread-name-prefix:DDFinance-Async-}")
    private String threadNamePrefix;

    @Value("${app.async.keep-alive-seconds:60}")
    private int keepAliveSeconds;

    @Value("${app.async.await-termination-seconds:60}")
    private int awaitTerminationSeconds;

    @Value("${app.scheduled.pool-size:5}")
    private int scheduledPoolSize;

    private final AtomicLong asyncExceptionCount = new AtomicLong(0);

    /**
     * Creates and configures the main task executor for async operations.
     *
     * @return configured ThreadPoolTaskExecutor
     */
    @Bean(name = "taskExecutor")
    @Primary
    public TaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        // Core thread pool configuration
        executor.setCorePoolSize(corePoolSize);
        executor.setMaxPoolSize(maxPoolSize);
        executor.setQueueCapacity(queueCapacity);
        executor.setThreadNamePrefix(threadNamePrefix);
        executor.setKeepAliveSeconds(keepAliveSeconds);

        // Shutdown configuration
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(awaitTerminationSeconds);

        // Rejection policy with logging
        executor.setRejectedExecutionHandler(new LoggingCallerRunsPolicy());

        // Task decorator for MDC context propagation
        executor.setTaskDecorator(runnable -> {
            // TODO: Add MDC context propagation when logging is fully configured
            return () -> {
                try {
                    runnable.run();
                } catch (Exception e) {
                    log.error("Error in async task execution", e);
                    throw e;
                }
            };
        });

        // Initialize the executor
        executor.initialize();

        log.info("Configured task executor - Core: {}, Max: {}, Queue: {}, Prefix: {}",
                corePoolSize, maxPoolSize, queueCapacity, threadNamePrefix);

        return executor;
    }

    /**
     * Creates a separate task executor for scheduled tasks.
     *
     * @return configured ThreadPoolTaskExecutor for scheduled tasks
     */
    @Bean(name = "scheduledTaskExecutor")
    public TaskExecutor scheduledTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        // Smaller pool for scheduled tasks
        executor.setCorePoolSize(1);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("DDFinance-Scheduled-");
        executor.setKeepAliveSeconds(keepAliveSeconds);

        // Shutdown configuration
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(awaitTerminationSeconds);

        // Rejection policy
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());

        // Initialize the executor
        executor.initialize();

        log.info("Configured scheduled task executor");

        return executor;
    }

    /**
     * Creates task scheduler for @Scheduled annotations.
     *
     * @return configured ThreadPoolTaskScheduler
     */
    @Bean
    public TaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(scheduledPoolSize);
        scheduler.setThreadNamePrefix("DDFinance-Scheduler-");
        scheduler.setWaitForTasksToCompleteOnShutdown(true);
        scheduler.setAwaitTerminationSeconds(awaitTerminationSeconds);
        scheduler.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        scheduler.initialize();

        log.info("Configured task scheduler with pool size: {}", scheduledPoolSize);

        return scheduler;
    }

    /**
     * Provides the async executor for the AsyncConfigurer interface.
     *
     * @return the async executor
     */
    @Override
    public Executor getAsyncExecutor() {
        return taskExecutor();
    }

    /**
     * Provides exception handler for uncaught exceptions in async methods.
     *
     * @return async uncaught exception handler
     */
    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return new CustomAsyncExceptionHandler();
    }

    /**
     * Gets the total count of async exceptions.
     *
     * @return exception count
     */
    public long getAsyncExceptionCount() {
        return asyncExceptionCount.get();
    }

    /**
     * Custom exception handler for async method execution.
     */
    private class CustomAsyncExceptionHandler implements AsyncUncaughtExceptionHandler {

        @Override
        public void handleUncaughtException(Throwable throwable, Method method, Object... params) {
            asyncExceptionCount.incrementAndGet();

            log.error("Uncaught exception in async method '{}' of class '{}' with {} parameters",
                     method.getName(),
                     method.getDeclaringClass().getSimpleName(),
                     params.length,
                     throwable);

            // Log parameter details at debug level
            if (log.isDebugEnabled() && params.length > 0) {
                log.debug("Method parameters: {}", Arrays.toString(params));
            }

            // TODO: Add notification service integration
            // TODO: Add metrics/monitoring integration
            // TODO: Add dead letter queue for failed async tasks
        }
    }

    /**
     * Custom rejection policy that logs rejected tasks.
     */
    private static class LoggingCallerRunsPolicy extends ThreadPoolExecutor.CallerRunsPolicy {

        @Override
        public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
            log.warn("Task rejected from thread pool. Pool size: {}, Active threads: {}, Queue size: {}, " +
                    "Queue remaining capacity: {}. Task will be run in caller thread.",
                    e.getPoolSize(),
                    e.getActiveCount(),
                    e.getQueue().size(),
                    e.getQueue().remainingCapacity());

            super.rejectedExecution(r, e);
        }
    }
}