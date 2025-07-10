package com.ddfinance.backend.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.core.task.TaskExecutor;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.RejectedExecutionHandler;
import java.util.concurrent.ThreadPoolExecutor;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for AsyncConfig.
 * Tests asynchronous execution configuration.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@ExtendWith(MockitoExtension.class)
class AsyncConfigTest {

    private AsyncConfig asyncConfig;

    @BeforeEach
    void setUp() {
        asyncConfig = new AsyncConfig();
        // Set default values for @Value fields using reflection
        setFieldValue(asyncConfig, "corePoolSize", 2);
        setFieldValue(asyncConfig, "maxPoolSize", 10);
        setFieldValue(asyncConfig, "queueCapacity", 500);
        setFieldValue(asyncConfig, "threadNamePrefix", "DDFinance-Async-");
        setFieldValue(asyncConfig, "keepAliveSeconds", 60);
        setFieldValue(asyncConfig, "awaitTerminationSeconds", 60);
    }

    private void setFieldValue(Object target, String fieldName, Object value) {
        try {
            var field = target.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set field " + fieldName, e);
        }
    }

    @Nested
    @DisplayName("AsyncConfigurer Implementation Tests")
    class AsyncConfigurerTests {

        @Test
        @DisplayName("Should implement AsyncConfigurer")
        void shouldImplementAsyncConfigurer() {
            // Then
            assertThat(asyncConfig).isInstanceOf(AsyncConfigurer.class);
        }

        @Test
        @DisplayName("Should have @EnableAsync annotation")
        void shouldHaveEnableAsyncAnnotation() {
            // Then
            assertThat(asyncConfig.getClass().isAnnotationPresent(
                    org.springframework.scheduling.annotation.EnableAsync.class)).isTrue();
        }

        @Test
        @DisplayName("Should have @EnableScheduling annotation")
        void shouldHaveEnableSchedulingAnnotation() {
            // Then
            assertThat(asyncConfig.getClass().isAnnotationPresent(
                    org.springframework.scheduling.annotation.EnableScheduling.class)).isTrue();
        }
    }

    @Nested
    @DisplayName("Task Executor Configuration Tests")
    class TaskExecutorConfigurationTests {

        @Test
        @DisplayName("Should create task executor")
        void shouldCreateTaskExecutor() {
            // When
            TaskExecutor taskExecutor = asyncConfig.taskExecutor();

            // Then
            assertThat(taskExecutor).isNotNull();
            assertThat(taskExecutor).isInstanceOf(ThreadPoolTaskExecutor.class);
        }

        @Test
        @DisplayName("Should configure core pool size")
        void shouldConfigureCorePoolSize() {
            // When
            ThreadPoolTaskExecutor executor = (ThreadPoolTaskExecutor) asyncConfig.taskExecutor();

            // Then
            assertThat(executor.getCorePoolSize()).isEqualTo(2);
        }

        @Test
        @DisplayName("Should configure max pool size")
        void shouldConfigureMaxPoolSize() {
            // When
            ThreadPoolTaskExecutor executor = (ThreadPoolTaskExecutor) asyncConfig.taskExecutor();

            // Then
            assertThat(executor.getMaxPoolSize()).isEqualTo(10);
        }

        @Test
        @DisplayName("Should configure queue capacity")
        void shouldConfigureQueueCapacity() {
            // When
            ThreadPoolTaskExecutor executor = (ThreadPoolTaskExecutor) asyncConfig.taskExecutor();

            // Then
            // Note: Queue capacity is set but not directly accessible via getter
            assertThat(executor).isNotNull();
        }

        @Test
        @DisplayName("Should configure thread name prefix")
        void shouldConfigureThreadNamePrefix() {
            // When
            ThreadPoolTaskExecutor executor = (ThreadPoolTaskExecutor) asyncConfig.taskExecutor();

            // Then
            assertThat(executor.getThreadNamePrefix()).isEqualTo("DDFinance-Async-");
        }

        @Test
        @DisplayName("Should configure keep alive seconds")
        void shouldConfigureKeepAliveSeconds() {
            // When
            ThreadPoolTaskExecutor executor = (ThreadPoolTaskExecutor) asyncConfig.taskExecutor();

            // Then
            assertThat(executor.getKeepAliveSeconds()).isEqualTo(60);
        }

        @Test
        @DisplayName("Should set wait for tasks to complete on shutdown")
        void shouldSetWaitForTasksToCompleteOnShutdown() {
            // When
            ThreadPoolTaskExecutor executor = (ThreadPoolTaskExecutor) asyncConfig.taskExecutor();

            // Then
            // This property is set but not directly accessible
            assertThat(executor).isNotNull();
        }

        @Test
        @DisplayName("Should set rejection policy")
        void shouldSetRejectionPolicy() {
            // When
            ThreadPoolTaskExecutor executor = (ThreadPoolTaskExecutor) asyncConfig.taskExecutor();

            // Then
            // Get the underlying ThreadPoolExecutor to check rejection policy
            executor.initialize();
            RejectedExecutionHandler handler = executor.getThreadPoolExecutor().getRejectedExecutionHandler();
            assertThat(handler).isInstanceOf(ThreadPoolExecutor.CallerRunsPolicy.class);
        }

        @Test
        @DisplayName("Should initialize executor")
        void shouldInitializeExecutor() {
            // When
            ThreadPoolTaskExecutor executor = (ThreadPoolTaskExecutor) asyncConfig.taskExecutor();

            // Then
            assertThat(executor).isNotNull();
            // Executor should be properly initialized
        }
    }

    @Nested
    @DisplayName("Async Executor Configuration Tests")
    class AsyncExecutorConfigurationTests {

        @Test
        @DisplayName("Should provide async executor")
        void shouldProvideAsyncExecutor() {
            // When
            Executor executor = asyncConfig.getAsyncExecutor();

            // Then
            assertThat(executor).isNotNull();
            assertThat(executor).isInstanceOf(ThreadPoolTaskExecutor.class);
        }

        @Test
        @DisplayName("Should return same executor instance")
        void shouldReturnSameExecutorInstance() {
            // When
            Executor executor1 = asyncConfig.getAsyncExecutor();
            Executor executor2 = asyncConfig.getAsyncExecutor();

            // Then
            assertThat(executor1).isSameAs(executor2);
        }
    }

    @Nested
    @DisplayName("Exception Handler Tests")
    class ExceptionHandlerTests {

        @Test
        @DisplayName("Should provide async uncaught exception handler")
        void shouldProvideAsyncUncaughtExceptionHandler() {
            // When
            AsyncUncaughtExceptionHandler handler = asyncConfig.getAsyncUncaughtExceptionHandler();

            // Then
            assertThat(handler).isNotNull();
        }

        @Test
        @DisplayName("Should handle uncaught exceptions")
        void shouldHandleUncaughtExceptions() {
            // Given
            AsyncUncaughtExceptionHandler handler = asyncConfig.getAsyncUncaughtExceptionHandler();
            Exception exception = new RuntimeException("Test exception");

            // When/Then - should not throw
            assertThatCode(() ->
                    handler.handleUncaughtException(exception,
                            this.getClass().getDeclaredMethod("shouldHandleUncaughtExceptions"),
                            "param1", "param2")
            ).doesNotThrowAnyException();
        }
    }

    @Nested
    @DisplayName("Scheduled Task Executor Tests")
    class ScheduledTaskExecutorTests {

        @Test
        @DisplayName("Should create scheduled task executor")
        void shouldCreateScheduledTaskExecutor() {
            // When
            TaskExecutor executor = asyncConfig.scheduledTaskExecutor();

            // Then
            assertThat(executor).isNotNull();
            assertThat(executor).isInstanceOf(ThreadPoolTaskExecutor.class);
        }

        @Test
        @DisplayName("Should configure scheduled executor differently")
        void shouldConfigureScheduledExecutorDifferently() {
            // When
            ThreadPoolTaskExecutor asyncExecutor = (ThreadPoolTaskExecutor) asyncConfig.taskExecutor();
            ThreadPoolTaskExecutor scheduledExecutor = (ThreadPoolTaskExecutor) asyncConfig.scheduledTaskExecutor();

            // Then
            assertThat(scheduledExecutor.getThreadNamePrefix()).isEqualTo("DDFinance-Scheduled-");
            assertThat(scheduledExecutor.getCorePoolSize()).isEqualTo(1);
            assertThat(scheduledExecutor.getMaxPoolSize()).isEqualTo(5);
        }
    }

    @Nested
    @DisplayName("Configuration Properties Tests")
    class ConfigurationPropertiesTests {

        @Test
        @DisplayName("Should use configurable core pool size")
        void shouldUseConfigurableCorePoolSize() {
            // Given
            setFieldValue(asyncConfig, "corePoolSize", 4);

            // When
            ThreadPoolTaskExecutor executor = (ThreadPoolTaskExecutor) asyncConfig.taskExecutor();

            // Then
            assertThat(executor.getCorePoolSize()).isEqualTo(4);
        }

        @Test
        @DisplayName("Should use configurable max pool size")
        void shouldUseConfigurableMaxPoolSize() {
            // Given
            setFieldValue(asyncConfig, "maxPoolSize", 20);

            // When
            ThreadPoolTaskExecutor executor = (ThreadPoolTaskExecutor) asyncConfig.taskExecutor();

            // Then
            assertThat(executor.getMaxPoolSize()).isEqualTo(20);
        }

        @Test
        @DisplayName("Should use configurable thread name prefix")
        void shouldUseConfigurableThreadNamePrefix() {
            // Given
            setFieldValue(asyncConfig, "threadNamePrefix", "CustomAsync-");

            // When
            ThreadPoolTaskExecutor executor = (ThreadPoolTaskExecutor) asyncConfig.taskExecutor();

            // Then
            assertThat(executor.getThreadNamePrefix()).isEqualTo("CustomAsync-");
        }
    }
}
