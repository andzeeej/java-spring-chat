package com.neo.listener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletContext;
import javax.servlet.annotation.WebListener;
import javax.servlet.http.*;
import java.util.HashSet;


// To implement listening, you need to open WebAppConfig @EnableWebMvc annotation
@WebListener
public class SessionListener implements HttpSessionListener, HttpSessionAttributeListener {
    public static final Logger logger = LoggerFactory.getLogger(SessionListener.class);

    @Override
    public void attributeAdded(HttpSessionBindingEvent httpSessionBindingEvent) {
        logger.info("--attributeAdded--");
        HttpSession session = httpSessionBindingEvent.getSession();
        logger.info("key----:" + httpSessionBindingEvent.getName());
        logger.info("value---:" + httpSessionBindingEvent.getValue());

    }

    @Override
    public void attributeRemoved(HttpSessionBindingEvent httpSessionBindingEvent) {
        logger.info("--attributeRemoved--");
    }

    @Override
    public void attributeReplaced(HttpSessionBindingEvent httpSessionBindingEvent) {
        logger.info("--attributeReplaced--");
    }

    @Override
    public void sessionCreated(HttpSessionEvent event) {
        logger.info("---sessionCreated----");
        HttpSession session = event.getSession();
        ServletContext application = session.getServletContext();
        // Save all sessions in the application scope by a HashSet set
        HashSet sessions = (HashSet) application.getAttribute("sessions");
        if (sessions == null) {
            sessions = new HashSet();
            application.setAttribute("sessions", sessions);
        }
        // Newly created sessions are added to the HashSet collection
        sessions.add(session);
        // Can take the sessions collection from the application scope elsewhere
        // Then use sessions.size() to get the number of currently active sessions, which is "number of people online"
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent event) throws ClassCastException {
        logger.info("---sessionDestroyed----");
        HttpSession session = event.getSession();
        logger.info("deletedSessionId: " + session.getId());
        System.out.println(session.getCreationTime());
        System.out.println(session.getLastAccessedTime());
        ServletContext application = session.getServletContext();
        HashSet sessions = (HashSet) application.getAttribute("sessions");
        // Destroyed sessions are removed from the HashSet set
        if (sessions != null && sessions.contains(session)) {
            sessions.remove(session);
        }
    }

}