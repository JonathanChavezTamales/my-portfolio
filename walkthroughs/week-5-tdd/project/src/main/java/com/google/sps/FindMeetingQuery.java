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

package com.google.sps;

import java.util.Collection;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.HashSet;



public final class FindMeetingQuery {

  public Collection<TimeRange> query(Collection<Event> events, MeetingRequest request) {

    if(request.getDuration() > TimeRange.WHOLE_DAY.duration()){
      return Arrays.asList();
    }

    ArrayList<TimeRange> busyTimes = new ArrayList<TimeRange>();

    // For each event, if at least contains one attendee of the request, consider it for the range of busy time.
    for(Event event: events){
      for(String attendee: request.getAttendees()){
        if(event.getAttendees().contains(attendee)){
          busyTimes.add(event.getWhen());
          break;
        }
      }
    }

    // Comparator of order of events
    Collections.sort(busyTimes, new Comparator<TimeRange>(){
      public int compare(TimeRange tr1, TimeRange tr2) {
        if(tr1.start() < tr2.start()) return -1;
        else if(tr1.start() == tr2.start()){
          if(tr1.start() <= tr2.start()) return -1;
          else if(tr1.start() == tr2.start()) return 0;
          else return -1;
        }
        else return 1;
      }
    });

    if(busyTimes.size() == 0){
      return Arrays.asList(TimeRange.WHOLE_DAY);
    }

    HashSet<Integer> indices = new HashSet<Integer>();
    indices.add(0);
    for(int i=1; i<busyTimes.size(); i++){
      // If times overlap
      if(busyTimes.get(i-1).end() >= busyTimes.get(i).start()){
        busyTimes.set(i, TimeRange.fromStartEnd(busyTimes.get(i-1).start(), Math.max(busyTimes.get(i).end(), busyTimes.get(i-1).end()), false));
        indices.remove(i-1);
      }
      indices.add(i);
    }

    List<TimeRange> freeTimes = new ArrayList<TimeRange>();
    int lastTime = TimeRange.START_OF_DAY;

    // freeTimes is just the complement of the union of busyTimes
    for(Integer index : indices){
      TimeRange current = busyTimes.get(index);
      TimeRange freeTime = TimeRange.fromStartEnd(lastTime, current.start(), false);
      lastTime = current.end();
      freeTimes.add(freeTime);
    }

    freeTimes.add(TimeRange.fromStartEnd(lastTime, TimeRange.END_OF_DAY, true));
    ArrayList<TimeRange> possibleTimes = new ArrayList<TimeRange>();
    for(TimeRange tr: freeTimes){
      if(tr.duration() >= request.getDuration()){
        possibleTimes.add(tr);
      }
    }

    return possibleTimes;
  }
}

