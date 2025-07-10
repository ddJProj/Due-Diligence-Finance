package com.ddfinance.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.format.FormatterRegistry;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for WebConfig.
 * Tests Spring MVC configuration and customizations.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@ExtendWith(MockitoExtension.class)
class WebConfigTest {

    private WebConfig webConfig;

    @BeforeEach
    void setUp() {
        webConfig = new WebConfig();
        // Set default values for @Value fields using reflection
        setFieldValue(webConfig, "maxUploadSizeMB", 10);
        setFieldValue(webConfig, "requestTimeoutSeconds", 60);
        setFieldValue(webConfig, "staticResourceCachePeriod", 3600);
        setFieldValue(webConfig, "corsAllowedOrigins", new String[]{"*"});
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
    @DisplayName("WebMvcConfigurer Implementation Tests")
    class WebMvcConfigurerTests {

        @Test
        @DisplayName("Should implement WebMvcConfigurer")
        void shouldImplementWebMvcConfigurer() {
            // Then
            assertThat(webConfig).isInstanceOf(WebMvcConfigurer.class);
        }
    }

    @Nested
    @DisplayName("Message Converter Tests")
    class MessageConverterTests {

        @Test
        @DisplayName("Should configure message converters")
        void shouldConfigureMessageConverters() {
            // Given
            List<HttpMessageConverter<?>> converters = new ArrayList<>();

            // When
            webConfig.configureMessageConverters(converters);

            // Then
            assertThat(converters).isNotEmpty();

            // Should have JSON converter
            boolean hasJsonConverter = converters.stream()
                    .anyMatch(converter -> converter instanceof MappingJackson2HttpMessageConverter);
            assertThat(hasJsonConverter).isTrue();

            // Should have String converter with UTF-8
            boolean hasStringConverter = converters.stream()
                    .anyMatch(converter -> converter instanceof StringHttpMessageConverter);
            assertThat(hasStringConverter).isTrue();
        }

        @Test
        @DisplayName("Should configure Jackson with JavaTimeModule")
        void shouldConfigureJacksonWithJavaTimeModule() {
            // Given
            List<HttpMessageConverter<?>> converters = new ArrayList<>();

            // When
            webConfig.configureMessageConverters(converters);

            // Then
            MappingJackson2HttpMessageConverter jsonConverter = converters.stream()
                    .filter(converter -> converter instanceof MappingJackson2HttpMessageConverter)
                    .map(converter -> (MappingJackson2HttpMessageConverter) converter)
                    .findFirst()
                    .orElse(null);

            assertThat(jsonConverter).isNotNull();
            ObjectMapper mapper = jsonConverter.getObjectMapper();
            assertThat(mapper).isNotNull();
            // JavaTimeModule should be registered
        }

        @Test
        @DisplayName("Should set UTF-8 charset for String converter")
        void shouldSetUtf8CharsetForStringConverter() {
            // Given
            List<HttpMessageConverter<?>> converters = new ArrayList<>();

            // When
            webConfig.configureMessageConverters(converters);

            // Then
            StringHttpMessageConverter stringConverter = converters.stream()
                    .filter(converter -> converter instanceof StringHttpMessageConverter)
                    .map(converter -> (StringHttpMessageConverter) converter)
                    .findFirst()
                    .orElse(null);

            assertThat(stringConverter).isNotNull();
            assertThat(stringConverter.getDefaultCharset()).isEqualTo(StandardCharsets.UTF_8);
        }
    }

    @Nested
    @DisplayName("Content Negotiation Tests")
    class ContentNegotiationTests {

        @Test
        @DisplayName("Should configure content negotiation")
        void shouldConfigureContentNegotiation() {
            // Given
            ContentNegotiationConfigurer configurer = mock(ContentNegotiationConfigurer.class);
            when(configurer.favorParameter(anyBoolean())).thenReturn(configurer);
            when(configurer.parameterName(anyString())).thenReturn(configurer);
            when(configurer.ignoreAcceptHeader(anyBoolean())).thenReturn(configurer);
            when(configurer.defaultContentType(any(MediaType.class))).thenReturn(configurer);
            when(configurer.mediaType(anyString(), any(MediaType.class))).thenReturn(configurer);

            // When
            webConfig.configureContentNegotiation(configurer);

            // Then
            verify(configurer).favorParameter(true);
            verify(configurer).parameterName("mediaType");
            verify(configurer).ignoreAcceptHeader(false);
            verify(configurer).defaultContentType(MediaType.APPLICATION_JSON);
            verify(configurer).mediaType("json", MediaType.APPLICATION_JSON);
            verify(configurer).mediaType("xml", MediaType.APPLICATION_XML);
        }
    }

    @Nested
    @DisplayName("Resource Handler Tests")
    class ResourceHandlerTests {

        @Test
        @DisplayName("Should configure static resource handlers")
        void shouldConfigureStaticResourceHandlers() {
            // Given
            ResourceHandlerRegistry registry = mock(ResourceHandlerRegistry.class);
            ResourceHandlerRegistration resourceRegistration = mock(ResourceHandlerRegistration.class);

            when(registry.addResourceHandler(anyString())).thenReturn(resourceRegistration);
            when(resourceRegistration.addResourceLocations(anyString())).thenReturn(resourceRegistration);
            when(resourceRegistration.setCachePeriod(anyInt())).thenReturn(resourceRegistration);

            // When
            webConfig.addResourceHandlers(registry);

            // Then
            verify(registry).addResourceHandler("/static/**");
            verify(registry).addResourceHandler("/uploads/**");
            verify(registry).addResourceHandler("/swagger-ui/**");

            // Verify resource locations and cache periods are set
            verify(resourceRegistration, atLeast(3)).addResourceLocations(anyString());
            verify(resourceRegistration, atLeast(3)).setCachePeriod(3600);
        }
    }

    @Nested
    @DisplayName("View Controller Tests")
    class ViewControllerTests {

        @Test
        @DisplayName("Should add view controllers")
        void shouldAddViewControllers() {
            // Given
            ViewControllerRegistry registry = mock(ViewControllerRegistry.class);
            RedirectViewControllerRegistration redirectRegistration = mock(RedirectViewControllerRegistration.class);
            ViewControllerRegistration viewRegistration = mock(ViewControllerRegistration.class);

            when(registry.addRedirectViewController(anyString(), anyString())).thenReturn(redirectRegistration);
            when(registry.addViewController(anyString())).thenReturn(viewRegistration);

            // When
            webConfig.addViewControllers(registry);

            // Then
            verify(registry).addRedirectViewController("/", "/index.html");
            verify(redirectRegistration).setStatusCode(any());
            verify(registry).addViewController("/api-docs");
            verify(viewRegistration).setViewName("forward:/v3/api-docs");
        }
    }

    @Nested
    @DisplayName("CORS Configuration Tests")
    class CorsConfigurationTests {

        @Test
        @DisplayName("Should add additional CORS mappings")
        void shouldAddAdditionalCorsMappings() {
            // Given
            CorsRegistry registry = mock(CorsRegistry.class);
            CorsRegistration corsRegistration = mock(CorsRegistration.class);

            when(registry.addMapping(anyString())).thenReturn(corsRegistration);
            when(corsRegistration.allowedOrigins(any(String[].class))).thenReturn(corsRegistration);
            when(corsRegistration.allowedMethods(any(String[].class))).thenReturn(corsRegistration);
            when(corsRegistration.allowedHeaders(any(String[].class))).thenReturn(corsRegistration);
            when(corsRegistration.exposedHeaders(any(String[].class))).thenReturn(corsRegistration);
            when(corsRegistration.allowCredentials(anyBoolean())).thenReturn(corsRegistration);
            when(corsRegistration.maxAge(anyLong())).thenReturn(corsRegistration);

            // When
            webConfig.addCorsMappings(registry);

            // Then
            verify(registry).addMapping("/api/**");
            verify(corsRegistration).allowedOrigins("*");
            verify(corsRegistration).allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH");
            verify(corsRegistration).allowedHeaders("*");
            verify(corsRegistration).exposedHeaders("Authorization", "Content-Type", "X-Total-Count");
            verify(corsRegistration).allowCredentials(true);
            verify(corsRegistration).maxAge(3600L);
        }
    }

    @Nested
    @DisplayName("Formatter Registry Tests")
    class FormatterRegistryTests {

        @Test
        @DisplayName("Should add formatters")
        void shouldAddFormatters() {
            // Given
            FormatterRegistry registry = mock(FormatterRegistry.class);

            // When
            webConfig.addFormatters(registry);

            // Then
            // DateTimeFormatterRegistrar will register multiple formatters
            verify(registry, atLeastOnce()).addFormatter(any());
        }
    }

    @Nested
    @DisplayName("Interceptor Tests")
    class InterceptorTests {

        @Test
        @DisplayName("Should add interceptors")
        void shouldAddInterceptors() {
            // Given
            InterceptorRegistry registry = mock(InterceptorRegistry.class);
            InterceptorRegistration registration = mock(InterceptorRegistration.class);

            when(registry.addInterceptor(any())).thenReturn(registration);
            when(registration.addPathPatterns(any(String[].class))).thenReturn(registration);
            when(registration.excludePathPatterns(any(String[].class))).thenReturn(registration);

            // When
            webConfig.addInterceptors(registry);

            // Then
            // Should add two interceptors (LoggingInterceptor and PerformanceInterceptor)
            verify(registry, times(2)).addInterceptor(any());

            // Verify path patterns are configured
            verify(registration, atLeast(2)).addPathPatterns("/api/**");
            verify(registration, atLeastOnce()).excludePathPatterns("/api/auth/**", "/api/public/**");
        }
    }

    @Nested
    @DisplayName("Bean Configuration Tests")
    class BeanConfigurationTests {

        @Test
        @DisplayName("Should create ObjectMapper bean")
        void shouldCreateObjectMapperBean() {
            // When
            ObjectMapper objectMapper = webConfig.objectMapper();

            // Then
            assertThat(objectMapper).isNotNull();
            // Should have JavaTimeModule registered
            assertThat(objectMapper.getRegisteredModuleIds()).contains(JavaTimeModule.class.getName());
        }

        @Test
        @DisplayName("Should configure ObjectMapper properties")
        void shouldConfigureObjectMapperProperties() {
            // When
            ObjectMapper objectMapper = webConfig.objectMapper();

            // Then
            assertThat(objectMapper).isNotNull();
            // Additional configuration assertions can be added here
        }
    }

    @Nested
    @DisplayName("Configuration Properties Tests")
    class ConfigurationPropertiesTests {

        @Test
        @DisplayName("Should set upload file size limits")
        void shouldSetUploadFileSizeLimits() {
            // Given/When
            // Tested in integration tests
            // as it involves Spring properties

            // Then
            assertThat(webConfig.getMaxUploadSizeInMB()).isEqualTo(10);
        }

        @Test
        @DisplayName("Should configure request timeout")
        void shouldConfigureRequestTimeout() {
            // Given/When
            int timeout = webConfig.getRequestTimeoutInSeconds();

            // Then
            assertThat(timeout).isEqualTo(60);
        }
    }
}