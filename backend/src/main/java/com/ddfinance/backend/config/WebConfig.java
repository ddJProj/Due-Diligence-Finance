package com.ddfinance.backend.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.format.datetime.standard.DateTimeFormatterRegistrar;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Web MVC configuration for the application.
 * Configures message converters, CORS, static resources, and other web-related settings.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Configuration
@EnableWebMvc
@Slf4j
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.max-size-mb:10}")
    private int maxUploadSizeMB;

    @Value("${app.request.timeout-seconds:60}")
    private int requestTimeoutSeconds;

    @Value("${app.static.cache-period:3600}")
    private int staticResourceCachePeriod;

    @Value("${app.cors.allowed-origins:*}")
    private String[] corsAllowedOrigins;

    /**
     * Configures HTTP message converters.
     * Adds JSON and String converters with proper encoding.
     *
     * @param converters list of message converters
     */
    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        // Add JSON message converter
        MappingJackson2HttpMessageConverter jsonConverter = new MappingJackson2HttpMessageConverter();
        jsonConverter.setObjectMapper(objectMapper());
        converters.add(jsonConverter);

        // Add String message converter with UTF-8
        StringHttpMessageConverter stringConverter = new StringHttpMessageConverter();
        stringConverter.setDefaultCharset(StandardCharsets.UTF_8);
        converters.add(stringConverter);

        log.info("Configured message converters: JSON and String (UTF-8)");
    }

    /**
     * Configures content negotiation strategy.
     *
     * @param configurer content negotiation configurer
     */
    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer
                .favorParameter(true)
                .parameterName("mediaType")
                .ignoreAcceptHeader(false)
                .defaultContentType(MediaType.APPLICATION_JSON)
                .mediaType("json", MediaType.APPLICATION_JSON)
                .mediaType("xml", MediaType.APPLICATION_XML);
    }

    /**
     * Configures static resource handlers.
     *
     * @param registry resource handler registry
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Static resources
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(staticResourceCachePeriod);

        // Upload directory
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/")
                .setCachePeriod(staticResourceCachePeriod);

        // Swagger UI resources
        registry.addResourceHandler("/swagger-ui/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/springfox-swagger-ui/")
                .setCachePeriod(staticResourceCachePeriod);

        log.info("Configured static resource handlers for /static/**, /uploads/** and /swagger-ui/**");
    }

    /**
     * Adds view controllers for specific URL mappings.
     *
     * @param registry view controller registry
     */
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addRedirectViewController("/", "/index.html")
                .setStatusCode(HttpStatus.MOVED_PERMANENTLY);

        // Add view controller for API documentation
        registry.addViewController("/api-docs").setViewName("forward:/v3/api-docs");
    }

    /**
     * Configures CORS mappings.
     * Note: Primary CORS configuration is in SecurityConfig, this adds additional mappings.
     *
     * @param registry CORS registry
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(corsAllowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .exposedHeaders("Authorization", "Content-Type", "X-Total-Count")
                .allowCredentials(true)
                .maxAge(3600L);
    }

    /**
     * Adds formatters for date/time and other types.
     *
     * @param registry formatter registry
     */
    @Override
    public void addFormatters(FormatterRegistry registry) {
        DateTimeFormatterRegistrar registrar = new DateTimeFormatterRegistrar();
        registrar.setDateFormatter(DateTimeFormatter.ISO_LOCAL_DATE);
        registrar.setDateTimeFormatter(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        registrar.registerFormatters(registry);
    }

    /**
     * Adds interceptors for request processing.
     *
     * @param registry interceptor registry
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LoggingInterceptor())
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/auth/**", "/api/public/**");

        registry.addInterceptor(new PerformanceInterceptor())
                .addPathPatterns("/api/**");
    }

    /**
     * Creates and configures ObjectMapper bean.
     *
     * @return configured ObjectMapper
     */
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();

        // Register JavaTimeModule for Java 8 time support
        mapper.registerModule(new JavaTimeModule());

        // Configure serialization features
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
        mapper.enable(SerializationFeature.INDENT_OUTPUT);

        // Configure deserialization features
        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        mapper.enable(DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT);
        mapper.enable(DeserializationFeature.READ_ENUMS_USING_TO_STRING);

        log.info("Configured Jackson ObjectMapper with JavaTimeModule");
        return mapper;
    }

    /**
     * Gets maximum upload size in MB.
     *
     * @return max upload size
     */
    public int getMaxUploadSizeInMB() {
        return maxUploadSizeMB;
    }

    /**
     * Gets request timeout in seconds.
     *
     * @return request timeout
     */
    public int getRequestTimeoutInSeconds() {
        return requestTimeoutSeconds;
    }

    /**
     * Logging interceptor for API requests.
     */
    private static class LoggingInterceptor implements HandlerInterceptor {

        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
            log.debug("Incoming request: {} {} from {}",
                    request.getMethod(), request.getRequestURI(), request.getRemoteAddr());
            return true;
        }

        @Override
        public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                    Object handler, Exception ex) {
            log.debug("Request completed: {} {} - Status: {}",
                    request.getMethod(), request.getRequestURI(), response.getStatus());
            if (ex != null) {
                log.error("Request failed with exception", ex);
            }
        }
    }

    /**
     * Performance monitoring interceptor.
     */
    private static class PerformanceInterceptor implements HandlerInterceptor {

        private static final String START_TIME_ATTR = "startTime";

        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
            request.setAttribute(START_TIME_ATTR, System.currentTimeMillis());
            return true;
        }

        @Override
        public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                    Object handler, Exception ex) {
            Long startTime = (Long) request.getAttribute(START_TIME_ATTR);
            if (startTime != null) {
                long duration = System.currentTimeMillis() - startTime;
                if (duration > 1000) {
                    log.warn("Slow request detected: {} {} took {}ms",
                            request.getMethod(), request.getRequestURI(), duration);
                }
            }
        }
    }
}