package nl.hubble.ui.meow.util;

import java.io.*;
import java.util.ArrayList;
import java.util.concurrent.Executors;
import java.util.function.Consumer;

public class MyConsole {
    private static class StreamGobbler implements Runnable {
        private final InputStream inputStream;
        private final Consumer<String> consumer;

        public StreamGobbler(InputStream inputStream, Consumer<String> consumer) {
            this.inputStream = inputStream;
            this.consumer = consumer;
        }

        @Override
        public void run() {
            new BufferedReader(new InputStreamReader(inputStream)).lines().forEach(consumer);
        }
    }

    public static boolean isWindows() {
        return System.getProperty("os.name")
                .toLowerCase().startsWith("windows");
    }

    public static ArrayList<String> runCommand(String command) throws IOException, InterruptedException {
        ArrayList<String> output = new ArrayList<>();
        Process process;
        if (isWindows()) {
            process = Runtime.getRuntime()
                    .exec(String.format("cmd.exe /c %s", command));
        } else {
            process = Runtime.getRuntime()
                    .exec(String.format("sh -c %s", command));
        }
        StreamGobbler streamGobbler = new StreamGobbler(process.getInputStream(), v -> {
            output.add(v);
        });
        Executors.newSingleThreadExecutor().submit(streamGobbler);
        process.waitFor();
        return output;
    }

    public static boolean runCommand(String command, Consumer<String> consumer) throws IOException, InterruptedException {
        ProcessBuilder builder = new ProcessBuilder();
        if (isWindows()) {
            builder.command("cmd.exe", "/c", command);
        } else {
            builder.command("sh", "-c", command);
        }
        builder.directory(new File(System.getProperty("user.home")));
        Process process = builder.start();
        StreamGobbler streamGobbler =
                new StreamGobbler(process.getInputStream(), consumer);
        Executors.newSingleThreadExecutor().submit(streamGobbler);

        return process.waitFor() == 0;
    }

    public static boolean processBuilderTest() throws IOException, InterruptedException {
        ProcessBuilder builder = new ProcessBuilder();
        if (isWindows()) {
            builder.command("cmd.exe", "/c", "dir");
        } else {
            builder.command("sh", "-c", "ls");
        }
        builder.directory(new File(System.getProperty("user.home")));
        Process process = builder.start();
        StreamGobbler streamGobbler =
                new StreamGobbler(process.getInputStream(), System.out::println);
        Executors.newSingleThreadExecutor().submit(streamGobbler);
        return process.waitFor() == 0;
    }
}
