"""
This script takes a .trk file, and converts it into a downsampled, 2-dimensional version.
"""
import nibabel as nib
import json
import numpy as np

trk_path = '/Users/ari/Dropbox/for_erin/1342338080.src.gz.odf8.f5.gqi.1.25.fib.trk.gz'

tracks = nib.streamlines.load(trk_path)

track_list_yz = []
track_list_xy = []
track_list_xz = []
for s in tracks.streamlines:
    s[:,0] = - s[:,0]
    s[:,1] = - s[:,1]

x_min  = np.min([x[:,0].min() for x in tracks.streamlines])
y_min  = np.min([x[:,1].min() for x in tracks.streamlines])
z_min  = np.min([x[:,2].min() for x in tracks.streamlines])
x_max  = np.max([x[:,0].max() for x in tracks.streamlines])
y_max  = np.max([x[:,1].max() for x in tracks.streamlines])
z_max  = np.max([x[:,2].max() for x in tracks.streamlines])

def normalize(streamline):
    streamline[:,0] = 400*(streamline[:,0] - x_min)/x_max
    streamline[:,1] = 400*(streamline[:,1] - y_min)/y_max
    streamline[:,2] = 400*(streamline[:,2] - z_min)/z_max
    return streamline.astype(np.int)

for i,s in enumerate(tracks.streamlines[:1000]):
    s = normalize(s)

    data = [[x[1],x[2]] for x in s.tolist()]
    track_list_yz.append({"id": i, "data":data})

    data = [[x[0],x[1]] for x in s.tolist()]
    track_list_xy.append({"id": i, "data":data})

    data = [[x[0],x[2]] for x in s.tolist()]
    track_list_xz.append({"id": i, "data":data})

with open('../data/tracks_yz.json', 'w') as f:
    json.dump(track_list_yz, f)
with open('../data/tracks_xz.json', 'w') as f:
    json.dump(track_list_xz, f)
with open('../data/tracks_xy.json', 'w') as f:
    json.dump(track_list_xy, f)
