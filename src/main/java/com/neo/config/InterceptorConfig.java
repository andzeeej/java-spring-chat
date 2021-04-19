package com.neo.config;


import com.alibaba.fastjson.JSON;
import com.neo.entity.Result;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.PrintWriter;


public class InterceptorConfig implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(InterceptorConfig.class);

    /**
     * Intercept the request before entering the controller layer
     *
     * @param request
     * @param response
     * @param o
     * @return
     * @throws Exception
     */
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object o) throws Exception {

//        log.info("---------------------Start entering request address interception----------------------------");
        HttpSession session = request.getSession();
        if (!StringUtils.isEmpty(session.getAttribute("username"))) {
            return true;
        } else {
            // Jump login
//            String url = "/login";
//            response.sendRedirect(url);
            PrintWriter printWriter = response.getWriter();
            printWriter.write(JSON.toJSONString(new Result(-1, "please login")));
            return false;
        }
    }

    @Override
    public void postHandle(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o, ModelAndView modelAndView) throws Exception {
//        log.info("--------------Processing operations before the view rendering is completed after the request is completed---------------");
    }

    @Override
    public void afterCompletion(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o, Exception e) throws Exception {
//        log.info("---------------Operation after view rendering-------------------------0");
    }
}