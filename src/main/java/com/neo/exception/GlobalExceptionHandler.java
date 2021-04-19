package com.neo.exception;

import com.alibaba.fastjson.JSON;
import com.neo.entity.Result;
import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.Enumeration;


@ControllerAdvice
public class GlobalExceptionHandler {

    private static Logger logger = LogManager.getLogger(GlobalExceptionHandler.class.getName());

    @ExceptionHandler(value = Exception.class)
    @ResponseBody
    public String errorHandler(HttpServletRequest req, Exception e) throws Exception {
        log(e, req);
        return JSON.toJSONString(new Result(-1, e.getMessage()));
    }

    @ExceptionHandler(value = ParameterException.class)
    @ResponseBody
    public String parameterHandler(Exception e) throws Exception {
        return JSON.toJSONString(new Result(-1, e.getMessage()));
    }

    //repeat
    @ExceptionHandler(value = RepeatException.class)
    @ResponseBody
    public String repeatHandler(Exception e) throws Exception {
        return JSON.toJSONString(new Result(-1, e.getMessage()));
    }

    private void log(Exception ex, HttpServletRequest request) {
        logger.error("There is an abnormality：============》" + ex.getMessage());
        logger.error("************************Abnormal start*******************************");
//        if(getUser() != null)
//            logger.error("Current user id is" + getUser().getUserId());
        logger.error(ex);
        logger.error("Request address：" + request.getRequestURL());
        Enumeration enumeration = request.getParameterNames();
        logger.error("Request parameter：");
        while (enumeration.hasMoreElements()) {
            String name = enumeration.nextElement().toString();
            logger.error(name + "---" + request.getParameter(name));
        }

        StackTraceElement[] error = ex.getStackTrace();
        for (StackTraceElement stackTraceElement : error) {
            logger.error(stackTraceElement.toString());
        }
        logger.error("************************Abnormal end*******************************");
    }

}