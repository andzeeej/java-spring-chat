package com.neo.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

import java.nio.charset.Charset;
import java.util.List;


@Configuration
//@EnableWebMvc
public class WebAppConfig extends WebMvcConfigurerAdapter {


    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        //Register a custom interceptor, add an intercept path and exclude the intercept path
        registry.addInterceptor(new InterceptorConfig())
                .addPathPatterns("/**")
                .excludePathPatterns("/user/login", "/user/register","/");
    }

    //The following two methods solve the garbled problem
    @Bean
    public HttpMessageConverter<String> responseBodyConverter() {
        HttpMessageConverter converter = new StringHttpMessageConverter(Charset.forName("UTF-8"));
        return converter;
    }

    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        super.configureMessageConverters(converters);
        converters.add(responseBodyConverter());
    }

}