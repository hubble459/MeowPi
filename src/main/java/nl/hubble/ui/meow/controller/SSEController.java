package nl.hubble.ui.meow.controller;

import nl.hubble.ui.meow.util.MyConsole;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.LinkedList;
import java.util.List;

@Controller
public class SSEController {
    private final List<SseEmitter> sseEmitters = new LinkedList<>();

    @GetMapping(path = "/register")
    public SseEmitter register() {
        System.out.println("Registering a stream.");

        SseEmitter emitter = new SseEmitter();

        synchronized (sseEmitters) {
            sseEmitters.add(emitter);
        }
        emitter.onCompletion(() -> sseEmitters.remove(emitter));

        return emitter;
    }

    @GetMapping(value = "/ccommand")
    @ResponseBody
    public String update(@RequestParam String command) throws IOException, InterruptedException {
        boolean succes = MyConsole.runCommand(command, s -> {

            synchronized (sseEmitters) {
                sseEmitters.forEach(emitter -> {
                    try {
                        emitter.send(s, MediaType.TEXT_PLAIN);
                    } catch (IOException e) {
                        emitter.complete();
                    }
                });
            }
        });
        String result = "Command was " + (succes ? "successful" : "unsuccessful") + "\n\t ==> " + command;
        System.out.println(result);
        return result;
    }
}
