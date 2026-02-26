import numpy as np

def simulate_clinic_schedule(predicted_durations, slot_length=20):

    predicted_durations = np.array(predicted_durations)

    total_idle = 0
    current_block_time = 0

    for duration in predicted_durations:

        if duration > slot_length:
            # Overrun counts as zero idle but resets block
            total_idle += 0
            current_block_time = 0
            continue

        if current_block_time + duration <= slot_length:
            current_block_time += duration
        else:
            total_idle += slot_length - current_block_time
            current_block_time = duration

    return abs(total_idle)