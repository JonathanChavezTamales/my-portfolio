// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.gson.Gson;
import java.io.IOException;
import java.util.ArrayList;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet that returns comments */
@WebServlet("/comment")
public class CommentServlet extends HttpServlet {

  /** Comment data structure */
  protected class Comment {
    private final String text;
    private final String user;
    private final long timestamp;

    public Comment(String user, String text, long timestamp) {
      this.text = text;
      this.user = user;
      this.timestamp = timestamp;
    }
  }

  /**
   * Adds all the comments in the DataStore to the response argument, in descending chronological
   * order
   */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Query query = new Query("comment").addSort("timestamp", SortDirection.ASCENDING);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);

    ArrayList<Comment> comments = new ArrayList<Comment>();

    for (Entity comment : results.asIterable()) {
      String user = (String) comment.getProperty("user");
      String text = (String) comment.getProperty("text");
      long timestamp = (long) comment.getProperty("timestamp");

      comments.add(new Comment(user, text, timestamp));
    }

    Gson gson = new Gson();
    response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(comments));
  }

  /** Adds a comment to the DataStore with data parsed from the body of the request */
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {

    // TODO(tabaresj): Check if user is logged in before doing everything else

    String comment = request.getParameter("comment");
    String user = "JonathanHardcodedSever";
    long timestamp = System.currentTimeMillis();

    if (comment != null && comment != "" && user != null && user != "") {
      Entity commentEntity = new Entity("comment");
      commentEntity.setProperty("user", user);
      commentEntity.setProperty("text", comment);
      commentEntity.setProperty("timestamp", timestamp);

      DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
      datastore.put(commentEntity);

      // TODO(tabaresj): Desired functionality is not to reload, check the onsubmit on js.
      response.sendRedirect("/");
    } else {
      // TODO(tabaresj): Handle this error
    }
  }
}
