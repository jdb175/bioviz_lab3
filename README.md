# bioviz-lab2
Interaction assessment of game of Life assignment for Bioviz

Supported Interactions:

Set random state
	-If the user does not know what state thay are interested in, the random state allows them to view how an arbitrary one behaves (multiple times, if they use the button more than once).
Painting cells
	-If the user wants to investigate the behavior of a specific board state, or modify some part of one, this gives them the flexibility to do so. This is especially useful for investigating a pattern that they may have noticed.
Reset to empty state
	-This is really just a convenience measure to make it easier to set up the desired state.
Start/stop simulation
	-The user can stop to inspect or modify the current state - this is needed because the simulation moves too quickly for the user to process the specific configurations as they pass.
Move forward or back one generation
	-This is useful to see in detail how the simulation progesses; either the
Click on history graph to jump to a generation
	-This allows a user to see what led to a particular state, and even go back to modify and see how things will be changed. Jumping into the future is a convenience measure.

more graphs
	-the user wants to be able to see trends in population as well as just the population, but needs the ability to control which they see to avoid making it too busy.
	- Discussion with Liz and classmates brought the idea of having multiple selectable options for the bottom graph
filtering for graphs
	-The use might want to focus on a specific part of the simulation, because they are interested in the structures or behavior there.
	-The idea was to allow the user to highlight a rectangular section to focus on, and only display that section and only graph info for that section
color change option  (trails)
	-The user wants to see information about the history of the state without having to traverse the graph.
	-The idea was to show cells that had been alive at one point with a separate color, possibly fading it as it remains dead.