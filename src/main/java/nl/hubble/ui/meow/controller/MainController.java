package nl.hubble.ui.meow.controller;

import nl.hubble.ui.meow.model.Service;
import nl.hubble.ui.meow.model.User;
import nl.hubble.ui.meow.util.MyConsole;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.ArrayList;

@Controller
@RequestMapping
public class MainController {
    @GetMapping("/login")
    private String handleGetLogin() {
        return "main";
    }

    @PostMapping("/login")
    private String handlePostLogin(HttpSession session, User user, Model model, @RequestParam(required = false) boolean error) {
        if (error) {
            model.addAttribute("error", true);
            return "main";
        } else {
            session.setAttribute("username", user.getUsername());
            return "redirect:/tools";
        }
    }

    @GetMapping("/logout")
    private String handlePostLogout(HttpSession session) {
        session.setAttribute("username", null);
        return "redirect:/login";
    }

    @GetMapping("/tools")
    private String handleGetHome() {
        return "main";
    }

    @GetMapping("/")
    private String handleGetRoot() {
        return "redirect:/tools";
    }

    @GetMapping("/spotify")
    private String handleGetSpotify() {
        return "main";
    }

    @GetMapping("/console")
    private String handleGetConsole(Model model) throws IOException, InterruptedException {
        String name = "Microsoft Windows";
        if (!MyConsole.isWindows()) {
            name = MyConsole.runCommand("uname -no").get(0);
        }
        model.addAttribute("console", name);

        return "main";
    }

    @GetMapping(value = "/services", produces = "application/json")
    @ResponseBody
    private ArrayList<Service> handleGetServices() throws IOException, InterruptedException {
        ArrayList<Service> list = new ArrayList<>();
        if (MyConsole.isWindows()) {
            ArrayList<String> output = MyConsole.runCommand("sc queryex type=service state=all | findstr \"SERVICE_NAME: DISPLAY_NAME: STATE PID\"");
            int vars = 4;
            if (output.size() % vars != 0) return list;
            for (int i = 0; i < output.size(); i += vars) {
                String id = output.get(i).replace("SERVICE_NAME: ", "");
                String name = output.get(i + 1).replace("DISPLAY_NAME: ", "");
                String state = output.get(i + 2).contains("RUNNING") ? "Running" : "Stopped";
                String pid = output.get(i + 3).split(": ")[1];
                if (pid.equals("0")) pid = "";
                Service s = new Service(id, name, state, pid);
                list.add(s);
            }
            return list;
        } else {
            MyConsole.runCommand("uname -no");
        }

        return list;
    }

    @GetMapping(value = "/command")
    @ResponseBody
    public boolean command(@RequestParam String command) throws IOException, InterruptedException {
        boolean success = MyConsole.runCommand(command, s -> {
        });
        System.out.println(success);
        return success;
    }

    @GetMapping(value = "/isWindows")
    @ResponseBody
    public boolean isWindows() {
        return MyConsole.isWindows();
    }
}
