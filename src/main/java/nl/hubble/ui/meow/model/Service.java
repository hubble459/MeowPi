package nl.hubble.ui.meow.model;

public class Service {
    private String id;
    private String name;
    private String state;
    private String pid;

    public Service(String id, String name, String state, String pid) {
        this.id = id;
        this.name = name;
        this.state = state;
        this.pid = pid;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPid() {
        return pid;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public void setPid(String pid) {
        this.pid = pid;
    }
}
