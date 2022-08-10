package nl.hubble.ui.meow.controller;

import nl.hubble.ui.meow.model.User;

import java.util.ArrayList;

public class DataProvider {
    private final static DataProvider instance = new DataProvider();

    private DataProvider() {
        users = new ArrayList<>();
        users.add(new User("mofan", "youcourtdeath"));
    }

    private final ArrayList<User> users;

    public static boolean hasUser(User user) {
        for (User u : instance.users) {
            if (u.getUsername().equals(user.getUsername())
                    && (u.getPassword().equals(user.getPassword()))) {
                return true;
            }
        }
        return false;
    }
}
