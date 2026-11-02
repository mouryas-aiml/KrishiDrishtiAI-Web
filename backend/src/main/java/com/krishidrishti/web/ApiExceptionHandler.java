package com.krishidrishti.web;

import org.springframework.http.HttpStatus;
import org.springframework.dao.DataAccessException;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    Map<String, String> badRequest(IllegalArgumentException exception) { return Map.of("error", exception.getMessage()); }
    @ExceptionHandler(DataAccessException.class)
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    Map<String, String> databaseError() { return Map.of("error", "The prediction was computed, but scan history is temporarily unavailable."); }
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    Map<String, String> serverError(Exception exception) {
        String message = exception.getMessage();
        return Map.of("error", message == null || message.isBlank() ? "The inference request failed." : message);
    }
}
