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

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;

public final class FindMeetingQuery {

  /**
   * Finds time slots available to host a meeting given the attendees's events and a meeting duration.
   *
   * Algorithmic complexity: Time O(mn), Space O(m) 
   * - First it checks for every event (n) if there's at least one attendee (n) from the request. In the worst case it no event will have such attendee.
   * - Then it creates a set with all the valid time slots, the worst case is when every attendee is on every slot, O(nm), but since it's a set, it has no repeated values, O(m)
   * - Later it does 3 copying and filter operations which are O(m)
   * - Extended Time Complexity = O(mn + nlogn + 3m) = O(mn)
   *
   * @param events Collection of events that will take place.
   * @param request Meeting request which has a collection of attendees and a duration
   * @return Collection of TimeRange slots available to host a meeting taking into consideration the attendees's events and the request
   */
  public Collection<TimeRange> query(Collection<Event> events, MeetingRequest request) {

    // CORNER CASE: If request lasts for more than one day.
    if (request.getDuration() > TimeRange.WHOLE_DAY.duration()) {
      return Arrays.asList();
    }

    // Array which has all the busy time slots from people in the request.
    HashSet<TimeRange> busyTimesSet = new HashSet<TimeRange>();

    // For each event, if at least contains one attendee of the request, consider it for the range
    // of busy time.
    for (Event event : events) {
      for (String attendee : request.getAttendees()) {
        if (event.getAttendees().contains(attendee)) {
          busyTimesSet.add(event.getWhen());
          break;
        }
      }
    }

    if (busyTimesSet.size() == 0) {
      return Arrays.asList(TimeRange.WHOLE_DAY);
    }

    // Sorts the events by start time and if those equal, sorts by end time.
    // It will look something like this: [(5,7), (6, 9), (6, 15)...]

    //Converts set to list to be ordered
    ArrayList<TimeRange> busyTimes = new ArrayList<TimeRange>(busyTimesSet);

    Collections.sort(
        busyTimes,
        new Comparator<TimeRange>() {
          public int compare(TimeRange tr1, TimeRange tr2) {
            if (tr1.start() < tr2.start()) return -1;
            else if (tr1.start() == tr2.start()) {
              if (tr1.start() <= tr2.start()) return -1;
              else if (tr1.start() == tr2.start()) return 0;
              else return -1;
            } else return 1;
          }
        });

    // Hashset used to mark those slots already merged
    HashSet<Integer> indices = new HashSet<Integer>();
    indices.add(0);

    // Starts iterating from index 1 and merging n and n-1.
    for (int i = 1; i < busyTimes.size(); i++) {
      // If times overlap, it will merge them and assign the new timeslot in the same index
      // e.g.: 1-(4,7), 2-(5, 9). Merging 1 and 2 = 1-(4,7) 2-(4,9)
      if (busyTimes.get(i - 1).end() >= busyTimes.get(i).start()) {
        busyTimes.set(
            i,
            TimeRange.fromStartEnd(
                busyTimes.get(i - 1).start(),
                Math.max(busyTimes.get(i).end(), busyTimes.get(i - 1).end()),
                false));
        // If merged, the first slot will be removed because the second one will be the updated one.
        indices.remove(i - 1);
      }
      // Mark that as merged
      indices.add(i);
    }

    // From all the merged and valid (marked) slots, create the complement slots.
    // e.g.: [#######]----[##]--[#]  <- busyTimes
    //       --------[####]--[##]--  <- freeTimes
    List<TimeRange> freeTimes = new ArrayList<TimeRange>();
    int lastTime = TimeRange.START_OF_DAY;

    // freeTimes is just the complement of the union of busyTimes
    for (Integer index : indices) {
      TimeRange current = busyTimes.get(index);
      TimeRange freeTime = TimeRange.fromStartEnd(lastTime, current.start(), false);
      lastTime = current.end();
      freeTimes.add(freeTime);
    }

    // Add remaining chunk of time
    freeTimes.add(TimeRange.fromStartEnd(lastTime, TimeRange.END_OF_DAY, true));

    // Filter just timeslots where duration is enough to host the meeting
    ArrayList<TimeRange> possibleTimes = new ArrayList<TimeRange>();
    for (TimeRange tr : freeTimes) {
      if (tr.duration() >= request.getDuration()) {
        possibleTimes.add(tr);
      }
    }

    return possibleTimes;
  }
}
