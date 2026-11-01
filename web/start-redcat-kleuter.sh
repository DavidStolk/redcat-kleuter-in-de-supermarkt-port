#!/bin/sh
# Linux: serves this folder on http://127.0.0.1 (only for this computer) and opens Redcat Kleuter 1 in
# the browser. Start it from a terminal with ./start-redcat-kleuter.sh, or let the file manager run
# it. Stop it with Ctrl+C or by closing the window.
cd "$(dirname "$0")" || exit 1
if command -v perl >/dev/null 2>&1; then
	exec perl serve.pl
fi
# without Perl: Python 3's own web server
if command -v python3 >/dev/null 2>&1; then
	PORT=8140
	echo "Redcat Kleuter 1: http://127.0.0.1:$PORT/  (press Ctrl+C to stop)"
	(sleep 1; xdg-open "http://127.0.0.1:$PORT/" >/dev/null 2>&1) &
	exec python3 -m http.server "$PORT" --bind 127.0.0.1
fi
echo "Redcat Kleuter 1 needs Perl or Python 3 to start its small web server; neither was found."
exit 1
