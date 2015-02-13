# bioviz-lab2
Interaction assessment of game of Life assignment for Bioviz. 

##Supported Interactions:
*Set random state*
- If the user does not know what state thay are interested in, the random state allows them to view how an arbitrary one behaves (multiple times, if they use the button more than once).

*Painting cells*
- If the user wants to investigate the behavior of a specific board state, or modify some part of one, this gives them the flexibility to do so. This is especially useful for investigating a pattern that they may have noticed.

*Reset to empty state*
- This is really just a convenience measure to make it easier to set up the desired state.

*Start/stop simulation*
- The user can stop to inspect or modify the current state - this is needed because the simulation moves too quickly for the user to process the specific configurations as they pass.

*Move forward or back one generation*
- This is useful to see in detail how the simulation progesses. They can watch how changes unfold in exact detail, and go backwards to see again or check how an interesting state came to be.

*Click on population graph to jump to a generation*
- This allows a user to see the details of any state within the last 400 generations. It helps with understanding because the user can see a point in the population chart that is particularly interesting (such as a sudden growth or precipitous drop), and immediately jump to see what led to it. They can then use all of the other interactions to better understand what is happening (replay it, go through step-by-step, etc), or even use painting to modify the state and see how it changes.
- The ability to jump forward is mostly a convenience, for seeing how a state (or modifications to a state) affect simulation behavior over time.

##Missing Interactions:
These interactions came from discussion with prof. Ryder and several classmates.

*More graphs*
* The user wants to be able to see trends in population as well as just the population (or possibly another metric that I have not thought of).
* There is not too much space for graphs, and it would quickly become busy if more were added. Discussion with Liz and classmates brought the idea of having multiple selectable options for the bottom graph, possibly from a dropdown.
* This would allow a wider array of graph options without overwhelming the user.

*filtering by section*
* The use might want to focus on a specific part of the simulation, because they are interested in the structures or behavior there.
* The idea was to allow the user to highlight a rectangular section to focus on, and only display that section and only graph info for that section. The rest of the simulation would not be visible, or possibly scaled down and faded.

*Color option  (trails)*
* The user wants to see information about the history of the state without having to traverse the graph.
* The idea was to show cells that had been alive at one point with a separate color. This would allow the user to see how far the simulation had spread before ending or reaching equilibrium.
* This wouldn't always be beneficial, which is why there is the interaction option to disable it.

I implemented the trails as a checkbox in my simulation.