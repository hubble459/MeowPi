package nl.hubble.ui.meow.controller;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

@Controller
public class CustomErrorController implements ErrorController {
    @RequestMapping("/error")
    public String handleError(Model model, HttpServletRequest request) {
        if (request.getAttribute("javax.servlet.error.status_code") != null) {
            int statusCode = (int) request.getAttribute("javax.servlet.error.status_code");
            Exception exception = (Exception) request.getAttribute("javax.servlet.error.exception");
            String msg;
            if (exception == null) {
                msg = (String) request.getAttribute("javax.servlet.error.message");
                if (msg == null || msg.isEmpty()) {
                    msg = getMessageFromApi(statusCode);
                    if (msg == null || msg.isEmpty()) {
                        msg = "N/A";
                    }
                }
            } else {
                msg = exception.getMessage();
            }
            String uri = (String) request.getAttribute("javax.servlet.error.request_uri");

            model.addAttribute("isError", true);
            model.addAttribute("statusCode", statusCode);
            model.addAttribute("exceptionMsg", msg);
            model.addAttribute("requestUri", uri);
        }

        return "main";
    }

    private String getMessageFromApi(int statusCode) {
        try {
            Document doc = Jsoup.connect("https://httpstat.us/" + statusCode).ignoreHttpErrors(true).get();
            return doc.text().replace(statusCode + " ", "");
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }


    @Override
    public String getErrorPath() {
        return "/error";
    }
}
