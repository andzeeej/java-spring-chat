package com.neo.controller;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.neo.entity.UserEntity;
import com.neo.enums.EResultType;
import com.neo.serivce.GroupSerivice;
import com.neo.serivce.UserSerivice;
import io.netty.util.internal.StringUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Controller
@RequestMapping(value = "/user")
public class UserController extends BaseController<UserEntity> {

    @Value("${server.port}")
    private Integer port;

    @Autowired
    UserSerivice userSerivice;

    @Autowired
    GroupSerivice groupSerivice;


    /**
     * log in
     *
     * @param name
     * @param password
     * @return
     */
    @ResponseBody
    @PostMapping(value = "/login")
    public String login(String name, String password) {

        if (StringUtil.isNullOrEmpty(name) || StringUtil.isNullOrEmpty(password)) {
            return retResultData(-1, "Username or password cannot be empty");
        }

        UserEntity user = userSerivice.findUserByUserName(name);
        if (user != null) {
            if (!user.getPassword().equals(password)) {
                return retResultData(EResultType.PASSWORK_ERROR);
            }
            user.setPassword("");
            session.setAttribute("username", user);
        } else {
            return retResultData(EResultType.PASSWORK_ERROR);
        }
        return retResultData(EResultType.SUCCESS, user);
    }

    // register
    @ResponseBody
    @PostMapping(value = "/register")
    public String register(String name, String password, String avatar) {

        if (StringUtil.isNullOrEmpty(name) || StringUtil.isNullOrEmpty(password)) {
            return retResultData(-1, "Username or password cannot be empty");
        }

        UserEntity user = userSerivice.findUserByUserName(name);
        if (user != null) {
            return retResultData(-1, "Username already exists");
        }

        user = userSerivice.register(name, password, avatar);

        return retResultData(EResultType.SUCCESS, user);
    }
/*
    //sign out
    @GetMapping(value = "/logout")
    public String logoutGet() {
        session.invalidate();
        return "/static/index.html";
    }
*/
    @ResponseBody
    @PostMapping(value = "/logout")
    public String logoutPost() {
        session.invalidate();
        return retResultData(EResultType.SUCCESS);
    }



    //Get the Token of the current logged in
    @ResponseBody
    @GetMapping(value = "/getToken")
    public String getAuthToken() {
        return retResultData(EResultType.SUCCESS, getSessionUser().getAuth_token());
    }


    //Modify the signature
    @ResponseBody
    @PostMapping(value = "/updateSign")
    public String updateSign(String sign) {

        UserEntity entity = getSessionUser();
        entity = (UserEntity) userSerivice.getEntityById(entity.getId());
        entity.setSign(sign);
        userSerivice.saveEntity(entity);

        return retResultData(0, "Successfully modified");
    }


    /**
     * Currently is the owner of the query system
     * And your own group
     * And created groups
     *
     * @return
     */
    @ResponseBody
    @GetMapping(value = "/findAllUser")
    public String findAllUser() {

        //Get all groups
        UserEntity userEntity = getSessionUser();

        JSONObject obj = new JSONObject();
        obj.put("mine", userEntity);

        //Grouping
        JSONArray array = new JSONArray();
        JSONObject f = new JSONObject();
        f.put("groupname", "my good friend");
        f.put("id", "0");
        f.put("list", userSerivice.selectAll());
        array.add(f);
        obj.put("friend", array);

        obj.put("group", groupSerivice.findMyGroupsByUserId(userEntity.getId()));

        return retResultData(0, "", obj);
    }


    /**
     * Message box information
     *
     * @return
     */
    @ResponseBody
    @GetMapping(value = "/findUsersByName")
    public String findUsersByName(String page, String name) {

        List<UserEntity> list = userSerivice.findUsersByName(page, name);
        return retResultData(0, "", list);
    }


    @Value("${web.upload-path}")
    private String path;        //File upload path

    //File Upload
    @PostMapping(value = "/upload")
    public @ResponseBody
    String uploadImg(@RequestParam("file") MultipartFile file,
                     HttpServletRequest request) throws UnknownHostException {

        if (file.isEmpty()) {
            return retResultData(-1, "Upload file cannot be empty");
        }

//        String contentType = file.getContentType();
        String fileName = file.getOriginalFilename();
        String uuid = UUID.randomUUID().toString();

        byte[] bytes = new byte[0];
        try {
            bytes = file.getBytes();
            Path ph = Paths.get(path + uuid + fileName);
            Files.write(ph, bytes);
        } catch (IOException e) {
            e.printStackTrace();
        }

        InetAddress addr = InetAddress.getLocalHost();
        String ip = addr.getHostAddress();//Get native IP
        JSONObject obj = new JSONObject();
        obj.put("src", "http://" + ip + ":" + port + "/static/" + uuid + fileName);
        //Return json
        return retResultData(0, "", obj);
    }

}
