package com.workshop;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.workshop.module.**.mapper")
public class WorkshopApplication {
    public static void main(String[] args) {
        SpringApplication.run(WorkshopApplication.class, args);
    }
}
