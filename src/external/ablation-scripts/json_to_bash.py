import json
import sys

INTERVALS = 50
with open(sys.argv[1], 'r') as fp:
	rankings = json.load(fp)
	for r in rankings:
		_rank = r['ranking']
		for idx in range(int(len(_rank)/INTERVALS)):
			start = int(idx * INTERVALS)
			name = r['name'] + " " + str(start)
			name = name.replace(" ","-")
			name = name.replace("/","-")
			print(name)
			print(" ".join([str(x) for x in _rank[:start]]))

		_rank = list(reversed(r['ranking']))
		for idx in range(int(len(_rank)/INTERVALS)):
			start = int(idx * INTERVALS)
			name = r['name'] + " " + str(start) + " Reverse"
			name = name.replace(" ","-")
			name = name.replace("/","-")
			print(name)
			print(" ".join([str(x) for x in _rank[:start]]))


		
		# 
		# print(r['name'] + " Reverse")
		# print(" ".join(reversed([str(x) for x in r['ranking']])))